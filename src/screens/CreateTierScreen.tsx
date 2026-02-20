import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native';
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
import { Colors, Spacing, Shadows } from '../theme/theme';
import TierRowComp from '../components/TierRow';
import ImageItem from '../components/ImageItem';
import TierEditModal from '../components/TierEditModal';
import { exportTierList } from '../utils/exportUtils';
import ViewShot from 'react-native-view-shot';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import AddItemModal from '../components/AddItemModal';
import AddRowModal from '../components/AddRowModal';
import AddTextItemModal from '../components/AddTextItemModal';
import { GestureHandlerRootView, PanGestureHandler, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    useAnimatedRef,
    measure,
} from 'react-native-reanimated';

const CreateTierScreen = ({ navigation, route }: any) => {
    const dispatch = useDispatch();
    const id = route.params?.id;
    const currentList = useSelector((state: RootState) =>
        state.tier.tierLists.find(l => l.id === id)
    );

    const [title, setTitle] = useState(currentList?.title || '');
    const [editingRow, setEditingRow] = useState<{ id: string, label: string, color: string, labelImageUri?: string } | null>(null);
    const viewRef = useRef<any>(null);
    const listContainerAnimatedRef = useAnimatedRef<View>();
    const listContainerRef = useRef<View>(null);
    const rankingListRef = useRef<any>(null);
    const [selectedItem, setSelectedItem] = useState<{ id: string, fromRowId: string | 'unranked' } | null>(null);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showAddRow, setShowAddRow] = useState(false);
    const [showAddText, setShowAddText] = useState(false);

    // Drag and Drop tracking
    const rowLayouts = useSharedValue<{ id: string, y: number, height: number }[]>([]);
    const rowOrder = useSharedValue<string[]>([]);
    const [hoveringRowId, setHoveringRowId] = useState<string | null>(null);
    const listAbsoluteY = useSharedValue(0);
    const scrollOffset = useSharedValue(0);
    const dragX = useSharedValue(0);
    const dragY = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const activeItemShared = useSharedValue<string | null>(null);
    const [activeDragItem, setActiveDragItem] = useState<TierItem | null>(null);

    React.useEffect(() => {
        if (id) {
            dispatch(setCurrentList(id));
        }
    }, [id, dispatch]);

    React.useEffect(() => {
        if (currentList?.rows) {
            rowOrder.value = currentList.rows.map(r => r.id);
        }
    }, [currentList?.rows]);

    React.useEffect(() => {
        setTimeout(measureList, 1000);
    }, []);

    const measureList = () => {
        if (!listContainerAnimatedRef.current) return;
        (listContainerAnimatedRef.current as any).measureInWindow((x: number, y: number, width: number, height: number) => {
            if (y > 0) {
                listAbsoluteY.value = y;
                // console.log('MEASURE: list top =', y);
            }
        });
    };

    const handlePickImage = async () => {
        const result = await launchImageLibrary({
            mediaType: 'photo',
            selectionLimit: 0,
        });

        if (result.assets) {
            result.assets.forEach(asset => {
                if (asset.uri) {
                    dispatch(addItemToUnranked({
                        id: Date.now().toString() + Math.random(),
                        imageUri: asset.uri
                    }));
                }
            });
        }
    };

    const handleAddNewItem = (data: { imageUri?: string, text?: string }) => {
        dispatch(addItemToUnranked({
            id: Date.now().toString() + Math.random(),
            ...data
        }));
    };

    const handleAddRow = (label: string, color: string, labelImageUri?: string) => {
        dispatch(addRow({ label, color, labelImageUri }));
    };

    const handleAddTextItem = (text: string, color: string) => {
        dispatch(addItemToUnranked({
            id: Date.now().toString() + Math.random(),
            text,
            backgroundColor: color
        }));
    };

    const handleItemPress = (itemId: string, rowId: string | 'unranked') => {
        if (selectedItem?.id === itemId) {
            setSelectedItem(null);
        } else {
            setSelectedItem({ id: itemId, fromRowId: rowId });
        }
    };

    const handleItemLongPress = (itemId: string, rowId: string | 'unranked') => {
        Alert.alert(
            'Delete Resource',
            'Are you sure you want to remove this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        dispatch(deleteItem({ itemId, rowId }));
                        if (selectedItem?.id === itemId) setSelectedItem(null);
                    }
                },
            ]
        );
    };

    const handleDrop = (itemId: string, toRowId: string) => {
        if (!itemId || !toRowId) {
            // console.log('Invalid drop');
            return;
        }

        // console.log('Successful drop to row:', toRowId);
        dispatch(moveItem({
            itemId: itemId,
            fromRowId: 'unranked',
            toRowId: toRowId
        }));

        // Reset state
        isDragging.value = false;
        activeItemShared.value = null;
        setActiveDragItem(null);
        setHoveringRowId(null);
        dragX.value = 0;
        dragY.value = 0;
    };

    const handleRowPress = (rowId: string | 'unranked') => {
        if (selectedItem) {
            dispatch(moveItem({
                itemId: selectedItem.id,
                fromRowId: selectedItem.fromRowId,
                toRowId: rowId
            }));
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
        Alert.alert(
            'Clear List',
            'Do you want to move all items back to the collection?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear All', style: 'destructive', onPress: () => dispatch(clearList()) },
            ]
        );
    };

    const handleExport = () => {
        exportTierList(viewRef);
    };

    const handleRowLayout = (rowId: string, event: any) => {
        const { y, height } = event.nativeEvent.layout;
        const currentLayouts = [...rowLayouts.value];
        const existingIndex = currentLayouts.findIndex(l => l.id === rowId);

        if (existingIndex > -1) {
            currentLayouts[existingIndex] = { id: rowId, y, height };
        } else {
            currentLayouts.push({ id: rowId, y, height });
        }

        // Sort by Y to ensure we check rows in top-to-bottom order
        currentLayouts.sort((a, b) => a.y - b.y);
        rowLayouts.value = currentLayouts;
        console.log('handleRowLayout:', rowId, 'y:', y, 'height:', height, 'currentLayouts:', JSON.stringify(currentLayouts.map(l => ({ id: l.id, y: l.y }))));
    };

    const findTargetRow = (absoluteY: number) => {
        'worklet';
        const measurement = measure(listContainerAnimatedRef);

        const pageY = (measurement && measurement.pageY > 0) ? measurement.pageY : listAbsoluteY.value;
        if (pageY <= 0) return null;

        const yInContent = (absoluteY - pageY) + scrollOffset.value;
        const layouts = rowLayouts.value;
        const order = rowOrder.value;

        // Robust cumulative detection: 
        // Iterate through rows in order and check if Y falls within currentY + height
        let currentY = 0;
        const rowMargin = 2; // Matches marginBottom: 2 in styles.rowContainer

        for (let i = 0; i < order.length; i++) {
            const rowId = order[i];
            const layout = layouts.find(l => l.id === rowId);

            // Use fallback height (90) if layout hasn't been reported yet
            // This prevents skipping the space of unmeasured rows at the top
            const height = layout ? layout.height : 90;

            if (yInContent >= currentY && yInContent <= currentY + height) {
                return rowId;
            }
            currentY += height + rowMargin;
        }

        return null;
    };


    const dragStyle = useAnimatedStyle(() => {
        return {
            position: 'absolute',
            top: 0,
            left: 0,
            width: 90,
            height: 90,
            zIndex: 10000,
            transform: [
                { translateX: dragX.value - 45 },
                { translateY: dragY.value - 45 },
                { scale: withSpring(isDragging.value ? 1.2 : 0) }
            ],
            opacity: withSpring(isDragging.value ? 1 : 0),
        };
    }, [isDragging]);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
                <View style={styles.header}>
                    <TextInput
                        style={styles.titleInput}
                        value={title}
                        onChangeText={handleTitleChange}
                        placeholder="List Name..."
                        placeholderTextColor={Colors.textMuted}
                    />
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={handleClearAll} style={styles.iconButton}>
                            <Ionicons name="trash-outline" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handleExport} style={styles.iconButton}>
                            <Ionicons name="share-outline" size={20} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.saveButton}>
                            <Text style={styles.saveButtonText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ViewShot
                    ref={viewRef}
                    options={{ format: 'png', quality: 0.9 }}
                    style={styles.captureArea}
                >
                    <Animated.View
                        ref={listContainerAnimatedRef}
                        collapsable={false}
                        style={{ flex: 1 }}
                        onLayout={(e) => {
                            setTimeout(measureList, 500);
                            setTimeout(measureList, 1500); // Retry for robustness
                        }}
                    >
                        <DraggableFlatList
                            data={currentList?.rows || []}
                            onDragEnd={({ data }) => dispatch(reorderRows({ listId: id, rows: data }))}
                            keyExtractor={(item) => item.id}
                            activationDistance={20}
                            onScrollOffsetChange={(offset) => {
                                scrollOffset.value = offset;
                            }}
                            style={styles.rankingArea}
                            containerStyle={{ flex: 1 }}
                            contentContainerStyle={styles.scrollContent}
                            renderItem={({ item, drag }: RenderItemParams<TierRow>) => (
                                <ScaleDecorator>
                                    <TierRowComp
                                        label={item.label}
                                        color={item.color}
                                        labelImageUri={item.labelImageUri}
                                        onLabelPress={() => setEditingRow(item)}
                                        onLabelLongPress={drag}
                                        onLayout={(e) => handleRowLayout(item.id, e)}
                                        isHighlighted={hoveringRowId === item.id}
                                    >
                                        {item.items.map(img => (
                                            <ImageItem
                                                key={img.id}
                                                uri={img.imageUri}
                                                text={img.text}
                                                backgroundColor={img.backgroundColor}
                                                onPress={() => handleItemPress(img.id, item.id)}
                                                onLongPress={() => handleItemLongPress(img.id, item.id)}
                                                selected={selectedItem?.id === img.id}
                                            />
                                        ))}
                                        {selectedItem && (
                                            <TouchableOpacity
                                                style={styles.dropZoneOverlay}
                                                onPress={() => handleRowPress(item.id)}
                                            >
                                                <View style={styles.dropZoneHint} />
                                            </TouchableOpacity>
                                        )}
                                    </TierRowComp>
                                </ScaleDecorator>
                            )}
                            ListHeaderComponent={
                                (currentList?.rows || []).length === 0 ? (
                                    <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
                                        No rows found!
                                    </Text>
                                ) : null
                            }
                        />
                    </Animated.View>
                </ViewShot>

                {/* Tray and Modals... */}
                {/* [Keep existing tray and modal code but add the DragPreview] */}

                <View style={styles.tray}>
                    {/* ... (will replace tray in next step for brevity) */}
                    <View style={styles.trayHeader}>
                        <Text style={styles.trayTitle}>Tools</Text>
                        <View style={styles.trayButtons}>
                            <TouchableOpacity onPress={() => setShowAddRow(true)} style={styles.toolButton}>
                                <Ionicons name="add-circle-outline" size={18} color={Colors.text} />
                                <Text style={styles.toolButtonText}>Row</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowAddText(true)} style={styles.toolButton}>
                                <Ionicons name="text-outline" size={18} color={Colors.text} />
                                <Text style={styles.toolButtonText}>Text</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={handlePickImage} style={styles.toolButton}>
                                <Ionicons name="image-outline" size={18} color={Colors.text} />
                                <Text style={styles.toolButtonText}>Image</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.trayContent}>
                        <DraggableFlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={currentList?.unrankedItems || []}
                            keyExtractor={(item) => item.id}
                            onDragEnd={({ data }) => dispatch(reorderUnrankedItems({ listId: id, items: data }))}
                            contentContainerStyle={styles.trayItems}
                            renderItem={({ item, drag }: RenderItemParams<TierItem>) => (
                                <GestureDetector
                                    gesture={Gesture.Pan()
                                        .activateAfterLongPress(150)
                                        .onBegin((event) => {
                                            activeItemShared.value = item.id;
                                            runOnJS(setActiveDragItem)(item);
                                            dragX.value = event.absoluteX;
                                            dragY.value = event.absoluteY;
                                            if (listAbsoluteY.value === 0) {
                                                runOnJS(measureList)();
                                            }
                                        })
                                        .onUpdate((event) => {
                                            isDragging.value = true;
                                            dragX.value = event.absoluteX;
                                            dragY.value = event.absoluteY;
                                            const targetId = findTargetRow(event.absoluteY);
                                            if (targetId !== hoveringRowId) {
                                                runOnJS(setHoveringRowId)(targetId);
                                            }
                                        })
                                        .onEnd((event) => {
                                            const targetId = findTargetRow(event.absoluteY);
                                            if (targetId) {
                                                runOnJS(handleDrop)(item.id, targetId);
                                            } else {
                                                // Reset if no target
                                                isDragging.value = false;
                                                activeItemShared.value = null;
                                                runOnJS(setActiveDragItem)(null);
                                                runOnJS(setHoveringRowId)(null);
                                                dragX.value = 0;
                                                dragY.value = 0;
                                            }
                                        })
                                    }
                                >
                                    <View>
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
                                <View style={styles.emptyTrayContainer}>
                                    <Text style={styles.emptyTrayText}>Add images or text to start ranking!</Text>
                                </View>
                            }
                        />
                    </View>
                </View>

                {/* Modals */}
                <AddRowModal
                    visible={showAddRow}
                    onClose={() => setShowAddRow(false)}
                    onSave={handleAddRow}
                />

                <AddTextItemModal
                    visible={showAddText}
                    onClose={() => setShowAddText(false)}
                    onSave={handleAddTextItem}
                />

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

            {/* Drag Preview - Outside SafeAreaView to match window coordinates */}
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.m,
        paddingVertical: Spacing.s,
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    titleInput: {
        flex: 1,
        fontSize: 18,
        color: Colors.text,
        fontWeight: '700',
        paddingVertical: 8,
        borderRadius: 30,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: Spacing.xs,
        backgroundColor: Colors.surfaceLight,
        borderRadius: 40,
    },
    iconText: {
        fontSize: 18,
    },
    saveButton: {
        paddingHorizontal: Spacing.m,
        paddingVertical: 8,
        backgroundColor: Colors.primary,
        borderRadius: 10,
        marginLeft: Spacing.s,
        ...Shadows.soft,
    },
    saveButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 13,
    },
    captureArea: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    rankingArea: {
        flex: 1,
    },
    scrollContent: {
        padding: Spacing.s,
        paddingBottom: 40,
    },
    dropZoneOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(108, 72, 255, 0.1)',
        zIndex: 10,
    },
    dropZoneHint: {
        width: 70,
        height: 70,
        borderWidth: 2,
        borderColor: Colors.primary,
        borderStyle: 'dashed',
        borderRadius: 8,
        margin: 4,
        opacity: 0.3,
    },
    tray: {
        height: 190,
        backgroundColor: Colors.surface,
        borderTopWidth: 1,
        borderTopColor: Colors.border,
        padding: Spacing.m,
    },
    trayHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.s,
    },
    trayButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    toolButton: {
        backgroundColor: Colors.surfaceLight,
        paddingHorizontal: Spacing.s,
        paddingVertical: 6,
        borderRadius: 10,
        marginLeft: Spacing.s,
        borderWidth: 1,
        borderColor: Colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    toolButtonText: {
        color: Colors.text,
        fontSize: 13,
        fontWeight: 'bold',
    },
    trayTitle: {
        color: Colors.text,
        fontSize: 14,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1.5,
    },
    addButton: {
        paddingHorizontal: Spacing.m,
        paddingVertical: 8,
        backgroundColor: Colors.primary,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
    },
    trayContent: {
        flex: 1,
    },
    trayItems: {
        alignItems: 'center',
        paddingHorizontal: Spacing.s,
        justifyContent: 'flex-start',
    },
    trayDropZone: {
        flexDirection: 'row',
        height: '100%',
        minWidth: 300,
        alignItems: 'center',
    },
    emptyTrayContainer: {
        flex: 1,
        width: 300,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyTrayText: {
        color: Colors.textMuted,
        fontSize: 14,
        textAlign: 'center',
        width: '100%',
    }
});

export default CreateTierScreen;
