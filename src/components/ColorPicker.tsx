import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, LayoutChangeEvent, TextInput } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { getDesignTokens } from '../theme/theme';

type HSV = {
    h: number;
    s: number;
    v: number;
};

type Control = 'outer' | 'inner';
type RGB = { r: number; g: number; b: number };

interface ColorPickerProps {
    value: string;
    onChange?: (hex: string) => void;
    disabled?: boolean;
}

const SIZE = 240;
const CENTER = SIZE / 2;
const OUTER_STROKE = 26;
const INNER_STROKE = 18;
const BASE_OUTER_RADIUS = CENTER - OUTER_STROKE;
const BASE_INNER_RADIUS = BASE_OUTER_RADIUS - OUTER_STROKE - INNER_STROKE;
const HANDLE_RADIUS = 7;
const OUTER_SEGMENTS = 140;
const INNER_SEGMENTS = 120;
const TOUCH_TOLERANCE = 14;

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));
const sanitizeHex = (text: string) => text.replace(/[^0-9a-fA-F]/g, '').toUpperCase().slice(0, 6);

const hexToRgb = (hex: string) => {
    if (!hex) return null;
    let normalized = hex.trim();
    if (!normalized.startsWith('#')) normalized = `#${normalized}`;
    if (/^#([0-9a-fA-F]{3})$/.test(normalized)) {
        normalized = `#${normalized[1]}${normalized[1]}${normalized[2]}${normalized[2]}${normalized[3]}${normalized[3]}`;
    }
    if (!/^#([0-9a-fA-F]{6})$/.test(normalized)) return null;
    const rgb: RGB = {
        r: parseInt(normalized.slice(1, 3), 16),
        g: parseInt(normalized.slice(3, 5), 16),
        b: parseInt(normalized.slice(5, 7), 16),
    };
    return rgb;
};

const rgbToHsv = (r: number, g: number, b: number): HSV => {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;
    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const delta = max - min;

    let h = 0;
    if (delta !== 0) {
        if (max === rn) {
            h = ((gn - bn) / delta) % 6;
        } else if (max === gn) {
            h = (bn - rn) / delta + 2;
        } else {
            h = (rn - gn) / delta + 4;
        }
        h *= 60;
    }
    const s = max === 0 ? 0 : delta / max;
    const v = max;
    return {
        h: (h + 360) % 360,
        s: clamp(s, 0, 1),
        v: clamp(v, 0, 1),
    };
};

const hsvToHex = ({ h, s, v }: HSV) => {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let r1 = 0;
    let g1 = 0;
    let b1 = 0;

    if (0 <= h && h < 60) {
        r1 = c;
        g1 = x;
    } else if (60 <= h && h < 120) {
        r1 = x;
        g1 = c;
    } else if (120 <= h && h < 180) {
        g1 = c;
        b1 = x;
    } else if (180 <= h && h < 240) {
        g1 = x;
        b1 = c;
    } else if (240 <= h && h < 300) {
        r1 = x;
        b1 = c;
    } else {
        r1 = c;
        b1 = x;
    }

    const r = Math.round((r1 + m) * 255);
    const g = Math.round((g1 + m) * 255);
    const b = Math.round((b1 + m) * 255);
    const toHex = (val: number) => val.toString(16).padStart(2, '0').toUpperCase();
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const hexToHsv = (hex: string): HSV | null => {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    return rgbToHsv(rgb.r, rgb.g, rgb.b);
};

const normalizeHsv = (hsv: HSV): HSV => ({
    h: ((hsv.h % 360) + 360) % 360,
    s: clamp(hsv.s, 0, 1),
    v: clamp(hsv.v, 0, 1),
});

const polarPoint = (angle: number, radius: number) => {
    const rad = (angle * Math.PI) / 180;
    return {
        x: CENTER + radius * Math.cos(rad),
        y: CENTER + radius * Math.sin(rad),
    };
};

const describeArc = (radius: number, startAngle: number, endAngle: number) => {
    const start = polarPoint(startAngle, radius);
    const end = polarPoint(endAngle, radius);
    const sweep = endAngle - startAngle;
    const largeArcFlag = sweep <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
};

const ColorPicker = ({ value, onChange, disabled = false }: ColorPickerProps) => {
    const theme = useSelector((state: RootState) => state.tier.theme);
    const DESIGN = getDesignTokens(theme);
    const fallback = hexToHsv(value) ?? { h: 0, s: 1, v: 1 };
    const [hsv, setHsv] = useState<HSV>(fallback);
    const [layoutSize, setLayoutSize] = useState(SIZE);
    const [hexInput, setHexInput] = useState(sanitizeHex(hsvToHex(fallback)));
    const [isTyping, setIsTyping] = useState(false);
    const controlRef = useRef<Control | null>(null);

    useEffect(() => {
        const parsed = hexToHsv(value);
        if (parsed) {
            setHsv(parsed);
        }
    }, [value]);

    useEffect(() => {
        if (!isTyping) {
            setHexInput(sanitizeHex(hsvToHex(hsv)));
        }
    }, [hsv, isTyping]);

    const outerRadius = BASE_OUTER_RADIUS;
    const innerRadius = BASE_INNER_RADIUS;
    const outerStroke = OUTER_STROKE;
    const innerStroke = INNER_STROKE;
    const outerMin = Math.max(0, outerRadius - outerStroke / 2 - TOUCH_TOLERANCE);
    const outerMax = outerRadius + outerStroke / 2 + TOUCH_TOLERANCE;
    const innerMin = Math.max(0, innerRadius - innerStroke / 2 - TOUCH_TOLERANCE);
    const innerMax = innerRadius + innerStroke / 2 + TOUCH_TOLERANCE;

    const updateColor = useCallback(
        (updater: (prev: HSV) => HSV) => {
            setIsTyping(false);
            setHsv(prev => {
                const next = normalizeHsv(updater(prev));
                onChange?.(hsvToHex(next));
                return next;
            });
        },
        [onChange]
    );

    const setHueFromAngle = useCallback(
        (angle: number) => {
            updateColor(prev => ({ ...prev, h: angle }));
        },
        [updateColor]
    );

    const setValueFromAngle = useCallback(
        (angle: number) => {
            const normalized = 1 - angle / 360;
            updateColor(prev => ({ ...prev, v: clamp(normalized, 0, 1) }));
        },
        [updateColor]
    );

    const determineControl = useCallback(
        (radius: number): Control | null => {
            if (radius >= outerMin && radius <= outerMax) return 'outer';
            if (radius >= innerMin && radius <= innerMax) return 'inner';
            return null;
        },
        [innerMax, innerMin, outerMax, outerMin]
    );

    const handleTouch = useCallback(
        (event: any, isInitial: boolean) => {
            const { locationX, locationY } = event.nativeEvent;
            const scaleFactor = SIZE / layoutSize;
            const x = locationX * scaleFactor;
            const y = locationY * scaleFactor;
            const dx = x - CENTER;
            const dy = y - CENTER;
            const radius = Math.sqrt(dx * dx + dy * dy);
            const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;

            let control = controlRef.current;
            if (isInitial || !control) {
                control = determineControl(radius);
                controlRef.current = control;
            }
            if (!control || disabled) return;
            if (control === 'outer') {
                setHueFromAngle(angle);
            } else {
                setValueFromAngle(angle);
            }
        },
        [determineControl, disabled, layoutSize, setHueFromAngle, setValueFromAngle]
    );

    const panResponder = useMemo(
        () =>
            PanResponder.create({
                onStartShouldSetPanResponder: () => !disabled,
                onStartShouldSetPanResponderCapture: () => !disabled,
                onMoveShouldSetPanResponder: () => !disabled,
                onMoveShouldSetPanResponderCapture: () => !disabled,
                onPanResponderGrant: evt => handleTouch(evt, true),
                onPanResponderMove: evt => handleTouch(evt, false),
                onPanResponderRelease: () => {
                    controlRef.current = null;
                },
                onPanResponderTerminate: () => {
                    controlRef.current = null;
                },
                onPanResponderTerminationRequest: () => false,
                onShouldBlockNativeResponder: () => true,
            }),
        [disabled, handleTouch]
    );

    const previewHex = hsvToHex(hsv);
    const brightnessAngle = (1 - hsv.v) * 360;
    const huePoint = polarPoint(hsv.h, outerRadius);
    const brightnessPoint = polarPoint(brightnessAngle, innerRadius);
    const huePreviewHex = hsvToHex({ h: hsv.h, s: 1, v: 1 });

    const outerSegments = useMemo(() => {
        const segments = [];
        const step = 360 / OUTER_SEGMENTS;
        for (let i = 0; i < OUTER_SEGMENTS; i++) {
            const start = i * step;
            const end = start + step + 0.25;
            const mid = (start + end) / 2;
            const color = hsvToHex({ h: mid % 360, s: 1, v: 1 });
            segments.push(
                <Path
                    key={`outer-${i}`}
                    d={describeArc(outerRadius, start, end)}
                    stroke={color}
                    strokeWidth={outerStroke}
                    strokeLinecap="butt"
                    fill="none"
                />
            );
        }
        return segments;
    }, [outerRadius, outerStroke]);

    const innerSegments = useMemo(() => {
        const segments = [];
        const step = 360 / INNER_SEGMENTS;
        const sat = clamp(Math.max(hsv.s, 0.05), 0, 1);
        for (let i = 0; i < INNER_SEGMENTS; i++) {
            const start = i * step;
            const end = start + step + 0.25;
            const mid = ((start + end) / 2) % 360;
            const value = clamp(1 - mid / 360, 0, 1);
            const color = hsvToHex({ h: hsv.h, s: sat, v: value });
            segments.push(
                <Path
                    key={`inner-${i}`}
                    d={describeArc(innerRadius, start, end)}
                    stroke={color}
                    strokeWidth={innerStroke}
                    strokeLinecap="butt"
                    fill="none"
                />
            );
        }
        return segments;
    }, [hsv.h, hsv.s, innerRadius, innerStroke]);

    const handleLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const { width } = event.nativeEvent.layout;
            if (!width) return;
            setLayoutSize(prev => {
                if (Math.abs(prev - width) < 0.5) return prev;
                return width;
            });
        },
        []
    );

    const handleHexChange = useCallback(
        (text: string) => {
            const sanitized = sanitizeHex(text);
            setIsTyping(true);
            setHexInput(sanitized);
            if (sanitized.length === 6) {
                const normalized = sanitized;
                const parsed = hexToHsv(`#${normalized}`);
                if (parsed) {
                    updateColor(() => normalizeHsv(parsed));
                }
            }
        },
        [updateColor]
    );

    return (
        <View style={[styles.wrapper, disabled && styles.wrapperDisabled]}>
            <View style={[styles.previewBox, { borderColor: DESIGN.border, backgroundColor: previewHex }]}>
                <Text style={[styles.previewLabel, { color: DESIGN.textSecondary }]}>Selected Color</Text>
                <View style={[styles.hexInputWrapper, { borderColor: DESIGN.border, backgroundColor: DESIGN.surface }]}>
                    <Text style={[styles.hexPrefix, { color: DESIGN.textSecondary }]}>#</Text>
                    <TextInput
                        style={[styles.hexInput, { color: DESIGN.textPrimary }]}
                        value={hexInput}
                        onChangeText={handleHexChange}
                        placeholder="FFFFFF"
                        placeholderTextColor={DESIGN.textMuted}
                        autoCapitalize="characters"
                        autoCorrect={false}
                        maxLength={6}
                        editable={!disabled}
                    />
                </View>
            </View>

            <View style={styles.ringContainer}>
                <View
                    style={styles.svgWrapper}
                    onLayout={handleLayout}
                    pointerEvents={disabled ? 'none' : 'auto'}
                    {...(!disabled ? panResponder.panHandlers : {})}
                >
                    <Svg
                        width="100%"
                        height="100%"
                        viewBox={`0 0 ${SIZE} ${SIZE}`}
                        pointerEvents="none"
                    >
                        {outerSegments}
                        {innerSegments}
                        <Circle
                            cx={huePoint.x}
                            cy={huePoint.y}
                            r={HANDLE_RADIUS}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                            fill={huePreviewHex}
                        />
                        <Circle
                            cx={brightnessPoint.x}
                            cy={brightnessPoint.y}
                            r={HANDLE_RADIUS}
                            stroke="#FFFFFF"
                            strokeWidth={2}
                            fill={previewHex}
                        />
                    </Svg>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 20,
        padding: 16,
        gap: 16,
    },
    wrapperDisabled: {
            opacity: 0.4,
        },
        previewBox: {
            borderWidth: 1,
            borderRadius: 16,
            padding: 16,
            gap: 10,
        },
        hexInputWrapper: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: 14,
            paddingHorizontal: 12,
            paddingVertical: 6,
        },
        hexPrefix: {
            fontSize: 16,
            fontWeight: '800',
            marginRight: 4,
        },
        hexInput: {
            flex: 1,
            fontSize: 18,
            fontWeight: '800',
            letterSpacing: 2,
        },
        previewLabel: {
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 1,
            textTransform: 'uppercase',
        },
        ringContainer: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        svgWrapper: {
            width: '100%',
            aspectRatio: 1,
        },
});

export default ColorPicker;
