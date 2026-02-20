import React, { useState, useRef, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    Alert,
    StatusBar,
    Platform,
    Dimensions,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { launchImageLibrary } from 'react-native-image-picker';
import {
    addItemToUnranked,
    setCurrentList,
    updateRow,
    moveItem,
    updateTitle,
    deleteItem,
    clearList,
    reorderRows,
    reorderUnrankedItems,
    addRow,
    TierRow,
    TierItem
} from '../store/slices/tierSlice';
import { RootState } from '../store/store';
import TierRowComp from '../components/TierRow';
import ImageItem from '../components/ImageItem';
import TierEditModal from '../components/TierEditModal';
import { exportTierList } from '../utils/exportUtils';
import ViewShot from 'react-native-view-shot';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import AddRowModal from '../components/AddRowModal';
import AddTextItemModal from '../components/AddTextItemModal';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    useAnimatedRef,
    measure,
} from 'react-native-reanimated';

import { getDesignTokens } from '../theme/theme';

const { width } = Dimensions.get('window');



// ─── CreateTierScreen ─────────────────────────────────────────────────────────
const CreateTierScreen = ({ navigation, route }: any) => {
    const dispatch = useDispatch();
    const id = route.params?.id;
    const theme = useSelector((state: RootState) => state.tier.theme);
    const isDarkMode = theme === 'dark';
    const D = getDesignTokens(theme);

    const currentList = useSelector((state: RootState) =>
        state.tier.tierLists.find(l => l.id === id)
    );

    const [title, setTitle] = useState(currentList?.title || '');
    const [editingRow, setEditingRow] = useState<{ id: string; label: string; color: string; labelImageUri?: string } | null>(null);
    const viewRef = useRef<any>(null);
    const listContainerAnimatedRef = useAnimatedRef<View>();
    const [selectedItem, setSelectedItem] = useState<{ id: string; fromRowId: string | 'unranked' } | null>(null);
    const [showAddRow, setShowAddRow] = useState(false);
    const [showAddText, setShowAddText] = useState(false);
    const [isTitleFocused, setIsTitleFocused] = useState(false);

    // Drag state
    const rowLayouts = useSharedValue<{ id: string; y: number; height: number }[]>([]);
    const rowOrder = useSharedValue<string[]>([]);
    const [hoveringRowId, setHoveringRowId] = useState<string | null>(null);
    const listAbsoluteY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const activeItemShared = useSharedValue<string | null>(null);
    const [activeDragItem, setActiveDragItem] = useState<TierItem | null>(null);
    const listHeight = useSharedValue(0);

    const styles = useMemo(() => StyleSheet.create({
        root: {
            flex: 1,
            backgroundColor: D.bg,
        },

        // Header
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: Platform.OS === 'android' ? 10 : 4,
            paddingBottom: 12,
            backgroundColor: D.bg,
            borderBottomWidth: 1,
            borderBottomColor: D.border,
            gap: 10,
        },
        backBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: D.surface,
            borderWidth: 1,
            borderColor: D.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        titleWrap: {
            flex: 1,
            height: 40,
            borderRadius: 10,
            backgroundColor: D.surface,
            borderWidth: 1,
            borderColor: D.border,
            justifyContent: 'center',
            paddingHorizontal: 12,
        },
        titleWrapFocused: {
            borderColor: D.accent,
            backgroundColor: D.accentSoft,
        },
        titleInput: {
            color: D.textPrimary,
            fontSize: 15,
            fontWeight: '700',
            letterSpacing: -0.2,
            padding: 0,
        },
        headerActions: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        headerBtn: {
            width: 36,
            height: 36,
            borderRadius: 10,
            backgroundColor: D.surface,
            borderWidth: 1,
            borderColor: D.border,
            justifyContent: 'center',
            alignItems: 'center',
        },
        doneBtn: {
            height: 36,
            paddingHorizontal: 16,
            backgroundColor: D.accent,
            borderRadius: 10,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: D.accent,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 8,
            elevation: 6,
        },
        doneBtnText: {
            color: '#fff',
            fontSize: 13,
            fontWeight: '800',
            letterSpacing: 0.2,
        },

        // Stats bar
        statsBar: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 9,
            paddingHorizontal: 20,
            backgroundColor: D.surface,
            borderBottomWidth: 1,
            borderBottomColor: D.border,
            gap: 16,
        },
        statItem: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
        },
        statDot: {
            width: 6,
            height: 6,
            borderRadius: 3,
        },
        statBarText: {
            color: D.textSecondary,
            fontSize: 12,
            fontWeight: '600',
            letterSpacing: 0.2,
        },
        statSep: {
            width: 1,
            height: 14,
            backgroundColor: D.border,
        },

        // Ranking area
        captureArea: {
            flex: 1,
            backgroundColor: D.bg,
        },
        rankingContent: {
            padding: 12,
            paddingBottom: 30,
        },
        rowWrapper: {
            marginBottom: 4,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: 'transparent',
        },
        rowWrapperHighlighted: {
            borderColor: D.accent,
            backgroundColor: D.accentSoft,
            shadowColor: D.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 8,
            elevation: 6,
        },
        dropOverlay: {
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(124, 92, 252, 0.08)',
            zIndex: 10,
        },
        dropTarget: {
            width: 60,
            height: 60,
            borderWidth: 2,
            borderColor: D.accent,
            borderStyle: 'dashed',
            borderRadius: 10,
            opacity: 0.5,
        },

        // Empty rows state
        emptyRows: {
            alignItems: 'center',
            paddingTop: 60,
            paddingHorizontal: 40,
        },
        emptyRowsIcon: {
            width: 64,
            height: 64,
            borderRadius: 18,
            backgroundColor: D.surface,
            borderWidth: 1,
            borderColor: D.border,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
        },
        emptyRowsTitle: {
            color: D.textPrimary,
            fontSize: 17,
            fontWeight: '700',
            marginBottom: 6,
        },
        emptyRowsBody: {
            color: D.textMuted,
            fontSize: 13,
            textAlign: 'center',
            fontWeight: '500',
        },

        // Tray
        tray: {
            height: 186,
            backgroundColor: D.surface,
            borderTopWidth: 1,
            borderTopColor: D.border,
            paddingTop: 14,
            paddingHorizontal: 16,
            paddingBottom: 8,
        },
        trayHeader: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 12,
        },
        trayLabelWrap: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
        },
        trayIndicator: {
            width: 3,
            height: 16,
            borderRadius: 2,
            backgroundColor: D.accent,
        },
        trayLabel: {
            color: D.textSecondary,
            fontSize: 12,
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: 1,
        },
        trayBadge: {
            backgroundColor: D.accentSoft,
            borderRadius: 6,
            paddingHorizontal: 7,
            paddingVertical: 2,
            borderWidth: 1,
            borderColor: `${D.accent}40`,
        },
        trayBadgeText: {
            color: D.accent,
            fontSize: 11,
            fontWeight: '700',
        },
        trayTools: {
            flexDirection: 'row',
            gap: 8,
        },
        toolBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 7,
            borderRadius: 10,
            gap: 5,
        },
        toolBtnIcon: {
            // subtle border handled inline
        },
        toolBtnLabel: {
            fontSize: 12,
            fontWeight: '700',
            letterSpacing: 0.2,
        },
        trayItems: {
            flex: 1,
        },
        trayScroll: {
            alignItems: 'center',
            paddingHorizontal: 4,
        },
        trayItemWrap: {
            marginHorizontal: 4,
        },

        // Empty tray
        emptyTray: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: 16,
            width: 300,
        },
        emptyTrayText: {
            color: D.textMuted,
            fontSize: 13,
            fontWeight: '500',
            flexShrink: 1,
        },
    }), [D]);

    const ToolBtn = ({
        icon,
        label,
        color,
        bg,
        onPress,
    }: {
        icon: string;
        label: string;
        color: string;
        bg: string;
        onPress: () => void;
    }) => (
        <TouchableOpacity style={[styles.toolBtn, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.8}>
            <View style={[styles.toolBtnIcon, { borderColor: `${color}40` }]}>
                <Ionicons name={icon} size={18} color={color} />
            </View>
            <Text style={[styles.toolBtnLabel, { color }]}>{label}</Text>
        </TouchableOpacity>
    );

    React.useEffect(() => {
        if (id) dispatch(setCurrentList(id));
    }, [id, dispatch]);

    React.useEffect(() => {
        if (currentList?.rows) rowOrder.value = currentList.rows.map(r => r.id);
    }, [currentList?.rows]);

    React.useEffect(() => {
        setTimeout(measureList, 1000);
    }, []);

    const measureList = () => {
        if (!listContainerAnimatedRef.current) return;
        (listContainerAnimatedRef.current as any).measureInWindow((_x: number, y: number, _w: number, h: number) => {
            if (y > 0) {
                listAbsoluteY.value = y;
                listHeight.value = h;
            }
        });
    };

    const handlePickImage = async () => {
        const result = await launchImageLibrary({ mediaType: 'photo', selectionLimit: 0 });
        if (result.assets) {
            result.assets.forEach(asset => {
                if (asset.uri) {
                    dispatch(addItemToUnranked({ id: Date.now().toString() + Math.random(), imageUri: asset.uri }));
                }
            });
        }
    };

    const handleAddRow = (label: string, color: string, labelImageUri?: string) => {
        dispatch(addRow({ label, color, labelImageUri }));
    };

    const handleAddTextItem = (text: string, color: string) => {
        dispatch(addItemToUnranked({ id: Date.now().toString() + Math.random(), text, backgroundColor: color }));
    };

    const handleItemPress = (itemId: string, rowId: string | 'unranked') => {
        setSelectedItem(selectedItem?.id === itemId ? null : { id: itemId, fromRowId: rowId });
    };

    const handleItemLongPress = (itemId: string, rowId: string | 'unranked') => {
        Alert.alert('Remove Item', 'Remove this item from the list?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Remove',
                style: 'destructive',
                onPress: () => {
                    dispatch(deleteItem({ itemId, rowId }));
                    if (selectedItem?.id === itemId) setSelectedItem(null);
                },
            },
        ]);
    };

    const handleDrop = (itemId: string, fromRowId: string | 'unranked', toRowId: string | 'unranked') => {
        if (!itemId || !toRowId || fromRowId === toRowId) {
            isDragging.value = false;
            activeItemShared.value = null;
            setActiveDragItem(null);
            setHoveringRowId(null);
            return;
        }

        dispatch(moveItem({ itemId, fromRowId, toRowId }));
        isDragging.value = false;
        activeItemShared.value = null;
        setActiveDragItem(null);
        setHoveringRowId(null);
        dragX.value = 0;
        dragY.value = 0;
    };

    const handleRowPress = (rowId: string | 'unranked') => {
        if (selectedItem) {
            dispatch(moveItem({ itemId: selectedItem.id, fromRowId: selectedItem.fromRowId, toRowId: rowId }));
            setSelectedItem(null);
        }
    };

    const handleSaveRow = (label: string, color: string, labelImageUri?: string) => {
        if (editingRow) {
            dispatch(updateRow({ rowId: editingRow.id, label, color, labelImageUri }));
            setEditingRow(null);
        }
    };

    const handleTitleChange = (text: string) => {
        setTitle(text);
        dispatch(updateTitle(text));
    };

    const handleClearAll = () => {
        Alert.alert('Clear List', 'Move all items back to the collection?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear All', style: 'destructive', onPress: () => dispatch(clearList()) },
        ]);
    };

    const handleRowLayout = (rowId: string, event: any) => {
        const { y, height } = event.nativeEvent.layout;
        const currentLayouts = [...rowLayouts.value];
        const existingIndex = currentLayouts.findIndex(l => l.id === rowId);
        if (existingIndex > -1) currentLayouts[existingIndex] = { id: rowId, y, height };
        else currentLayouts.push({ id: rowId, y, height });
        currentLayouts.sort((a, b) => a.y - b.y);
        rowLayouts.value = currentLayouts;
    };

    const findTargetRow = (absoluteY: number) => {
        'worklet';
        const measurement = measure(listContainerAnimatedRef);
        const pageY = measurement && measurement.pageY > 0 ? measurement.pageY : listAbsoluteY.value;
        const pageH = measurement && measurement.height > 0 ? measurement.height : listHeight.value;

        if (pageY <= 0) return null;

        // If dropped below the list area, assume it's the tray
        if (absoluteY > pageY + pageH) return 'unranked';

        const yInContent = absoluteY - pageY + scrollOffset.value;
        const layouts = rowLayouts.value;
        const order = rowOrder.value;
        let currentY = 0;
        for (let i = 0; i < order.length; i++) {
            const rowId = order[i];
            const layout = layouts.find(l => l.id === rowId);
            const height = layout ? layout.height : 90;
            if (yInContent >= currentY && yInContent <= currentY + height) return rowId;
            currentY += height + 2;
        }
        return null;
    };

    const dragStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        top: 0,
        left: 0,
        width: 90,
        height: 90,
        zIndex: 10000,
        transform: [
            { translateX: dragX.value - 45 },
            { translateY: dragY.value - 45 },
            { scale: withSpring(isDragging.value ? 1.2 : 0) },
        ],
        opacity: withSpring(isDragging.value ? 1 : 0),
    }));

    const totalItems = (currentList?.rows || []).reduce((a, r) => a + r.items.length, 0);
    const unrankedCount = currentList?.unrankedItems?.length || 0;

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.root}>
                <StatusBar barStyle="light-content" backgroundColor={D.bg} />

                {/* ── Header ── */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.backBtn}
                        onPress={() => navigation.goBack()}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                        <Ionicons name="chevron-back" size={20} color={D.textSecondary} />
                    </TouchableOpacity>

                    <View style={[styles.titleWrap, isTitleFocused && styles.titleWrapFocused]}>
                        <TextInput
                            style={styles.titleInput}
                            value={title}
                            onChangeText={handleTitleChange}
                            placeholder="List name…"
                            placeholderTextColor={D.textMuted}
                            onFocus={() => setIsTitleFocused(true)}
                            onBlur={() => setIsTitleFocused(false)}
                            selectionColor={D.accent}
                        />
                    </View>

                    <View style={styles.headerActions}>
                        <TouchableOpacity style={styles.headerBtn} onPress={handleClearAll}>
                            <Ionicons name="trash-outline" size={18} color={D.red} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.headerBtn}
                            onPress={() => exportTierList(viewRef)}
                        >
                            <Ionicons name="share-outline" size={18} color={D.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.doneBtn} onPress={() => navigation.goBack()}>
                            <Text style={styles.doneBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Stats bar ── */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: D.accent }]} />
                        <Text style={styles.statBarText}>{currentList?.rows?.length || 0} tiers</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: D.green }]} />
                        <Text style={styles.statBarText}>{totalItems} ranked</Text>
                    </View>
                    <View style={styles.statSep} />
                    <View style={styles.statItem}>
                        <View style={[styles.statDot, { backgroundColor: D.amber }]} />
                        <Text style={styles.statBarText}>{unrankedCount} pending</Text>
                    </View>
                </View>

                {/* ── Ranking area ── */}
                <ViewShot
                    ref={viewRef}
                    options={{ format: 'png', quality: 0.9 }}
                    style={styles.captureArea}
                >
                    <Animated.View
                        ref={listContainerAnimatedRef}
                        collapsable={false}
                        style={{ flex: 1 }}
                        onLayout={() => {
                            setTimeout(measureList, 500);
                            setTimeout(measureList, 1500);
                        }}
                    >
                        <DraggableFlatList
                            data={currentList?.rows || []}
                            onDragEnd={({ data }) => dispatch(reorderRows({ listId: id, rows: data }))}
                            keyExtractor={(item) => item.id}
                            activationDistance={20}
                            onScrollOffsetChange={(offset) => { scrollOffset.value = offset; }}
                            style={{ flex: 1 }}
                            containerStyle={{ flex: 1 }}
                            contentContainerStyle={styles.rankingContent}
                            renderItem={({ item, drag }: RenderItemParams<TierRow>) => (
                                <ScaleDecorator>
                                    <View
                                        style={[
                                            styles.rowWrapper,
                                            hoveringRowId === item.id && styles.rowWrapperHighlighted,
                                        ]}
                                        onLayout={(e) => handleRowLayout(item.id, e)}
                                    >
                                        <TierRowComp
                                            label={item.label}
                                            color={item.color}
                                            labelImageUri={item.labelImageUri}
                                            onLabelPress={() => setEditingRow(item)}
                                            onLabelLongPress={drag}
                                        >
                                            {item.items.map(img => (
                                                <GestureDetector
                                                    key={img.id}
                                                    gesture={Gesture.Pan()
                                                        .activateAfterLongPress(150)
                                                        .onBegin((e) => {
                                                            activeItemShared.value = img.id;
                                                            runOnJS(setActiveDragItem)(img);
                                                            dragX.value = e.absoluteX;
                                                            dragY.value = e.absoluteY;
                                                            if (listAbsoluteY.value === 0) runOnJS(measureList)();
                                                        })
                                                        .onUpdate((e) => {
                                                            isDragging.value = true;
                                                            dragX.value = e.absoluteX;
                                                            dragY.value = e.absoluteY;
                                                            const targetId = findTargetRow(e.absoluteY);
                                                            if (targetId !== hoveringRowId) runOnJS(setHoveringRowId)(targetId);
                                                        })
                                                        .onEnd((e) => {
                                                            const targetId = findTargetRow(e.absoluteY);
                                                            runOnJS(handleDrop)(img.id, item.id, targetId || item.id);
                                                        })}
                                                >
                                                    <View>
                                                        <ImageItem
                                                            uri={img.imageUri}
                                                            text={img.text}
                                                            backgroundColor={img.backgroundColor}
                                                            onPress={() => handleItemPress(img.id, item.id)}
                                                            onLongPress={() => handleItemLongPress(img.id, item.id)}
                                                            selected={selectedItem?.id === img.id}
                                                        />
                                                    </View>
                                                </GestureDetector>
                                            ))}
                                            {selectedItem && (
                                                <TouchableOpacity
                                                    style={styles.dropOverlay}
                                                    onPress={() => handleRowPress(item.id)}
                                                >
                                                    <View style={styles.dropTarget} />
                                                </TouchableOpacity>
                                            )}
                                        </TierRowComp>
                                    </View>
                                </ScaleDecorator>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyRows}>
                                    <View style={styles.emptyRowsIcon}>
                                        <Ionicons name="layers-outline" size={32} color={D.textMuted} />
                                    </View>
                                    <Text style={styles.emptyRowsTitle}>No tiers yet</Text>
                                    <Text style={styles.emptyRowsBody}>Add a tier row to start ranking</Text>
                                </View>
                            }
                        />
                    </Animated.View>
                </ViewShot>

                {/* ── Tray ── */}
                <View style={styles.tray}>
                    {/* Tray header */}
                    <View style={styles.trayHeader}>
                        <View style={styles.trayLabelWrap}>
                            <View style={styles.trayIndicator} />
                            <Text style={styles.trayLabel}>Collection</Text>
                            {unrankedCount > 0 && (
                                <View style={styles.trayBadge}>
                                    <Text style={styles.trayBadgeText}>{unrankedCount}</Text>
                                </View>
                            )}
                        </View>

                        <View style={styles.trayTools}>
                            <ToolBtn
                                icon="add-circle-outline"
                                label="Row"
                                color={D.accent}
                                bg={D.accentSoft}
                                onPress={() => setShowAddRow(true)}
                            />
                            <ToolBtn
                                icon="text-outline"
                                label="Text"
                                color={D.cyan}
                                bg={D.cyanSoft}
                                onPress={() => setShowAddText(true)}
                            />
                            <ToolBtn
                                icon="image-outline"
                                label="Image"
                                color={D.green}
                                bg={D.greenSoft}
                                onPress={handlePickImage}
                            />
                        </View>
                    </View>

                    {/* Tray items */}
                    <View style={styles.trayItems}>
                        <DraggableFlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={currentList?.unrankedItems || []}
                            keyExtractor={(item) => item.id}
                            onDragEnd={({ data }) => dispatch(reorderUnrankedItems({ listId: id, items: data }))}
                            contentContainerStyle={styles.trayScroll}
                            renderItem={({ item }: RenderItemParams<TierItem>) => (
                                <GestureDetector
                                    gesture={Gesture.Pan()
                                        .activateAfterLongPress(150)
                                        .onBegin((e) => {
                                            activeItemShared.value = item.id;
                                            runOnJS(setActiveDragItem)(item);
                                            dragX.value = e.absoluteX;
                                            dragY.value = e.absoluteY;
                                            if (listAbsoluteY.value === 0) runOnJS(measureList)();
                                        })
                                        .onUpdate((e) => {
                                            isDragging.value = true;
                                            dragX.value = e.absoluteX;
                                            dragY.value = e.absoluteY;
                                            const targetId = findTargetRow(e.absoluteY);
                                            if (targetId !== hoveringRowId) runOnJS(setHoveringRowId)(targetId);
                                        })
                                        .onEnd((e) => {
                                            const targetId = findTargetRow(e.absoluteY);
                                            runOnJS(handleDrop)(item.id, 'unranked', targetId || 'unranked');
                                        })}
                                >
                                    <View style={styles.trayItemWrap}>
                                        <ImageItem
                                            uri={item.imageUri}
                                            text={item.text}
                                            backgroundColor={item.backgroundColor}
                                            onPress={() => handleItemPress(item.id, 'unranked')}
                                            selected={selectedItem?.id === item.id}
                                        />
                                    </View>
                                </GestureDetector>
                            )}
                            ListEmptyComponent={
                                <View style={styles.emptyTray}>
                                    <Ionicons name="cloud-upload-outline" size={22} color={D.textMuted} />
                                    <Text style={styles.emptyTrayText}>Add images or text to start ranking</Text>
                                </View>
                            }
                        />
                    </View>
                </View>

                {/* ── Modals ── */}
                <AddRowModal visible={showAddRow} onClose={() => setShowAddRow(false)} onSave={handleAddRow} />
                <AddTextItemModal visible={showAddText} onClose={() => setShowAddText(false)} onSave={handleAddTextItem} />
                {editingRow && (
                    <TierEditModal
                        visible={!!editingRow}
                        initialLabel={editingRow.label}
                        initialColor={editingRow.color}
                        initialLabelImage={editingRow.labelImageUri}
                        onClose={() => setEditingRow(null)}
                        onSave={handleSaveRow}
                    />
                )}
            </SafeAreaView>

            {/* Drag preview */}
            <Animated.View style={dragStyle} pointerEvents="none">
                {activeDragItem && (
                    <ImageItem
                        uri={activeDragItem.imageUri}
                        text={activeDragItem.text}
                        backgroundColor={activeDragItem.backgroundColor}
                        width={90}
                        height={90}
                    />
                )}
            </Animated.View>
        </GestureHandlerRootView>
    );
};


export default CreateTierScreen;