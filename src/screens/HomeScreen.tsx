import React, { useState, useMemo, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    TextInput,
    Alert,
    Share,
    Platform,
    Animated,
    Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { createNewList, reorderLists, deleteList, renameList } from '../store/slices/tierSlice';
import { getDesignTokens } from '../theme/theme';
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { TierList } from '../store/slices/tierSlice';

const { width } = Dimensions.get('window');

// ─── Animated Card ────────────────────────────────────────────────────────────
const AnimatedCard = ({
    item,
    drag,
    isActive,
    isMenuOpen,
    onPress,
    onMenuPress,
    onRename,
    onShare,
    onDelete,
    navigation,
    DESIGN,
}: any) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 20 }).start();
    };
    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }).start();
    };

    const totalItems = item.rows.reduce((acc: number, r: any) => acc + r.items.length, 0);
    const tierCount = item.rows.length;

    // Deterministic pastel badge color per list
    const hue = (parseInt(item.id.slice(-4), 16) || 0) % 360;
    const badgeColor = `hsl(${hue}, 70%, 65%)`;
    const badgeBg = `hsla(${hue}, 70%, 65%, 0.12)`;

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                activeOpacity={1}
                onPress={onPress}
                onLongPress={drag}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={[
                    styles.card,
                    { backgroundColor: DESIGN.card, borderColor: DESIGN.cardBorder },
                    isActive && { borderColor: DESIGN.accent, shadowColor: DESIGN.accent, shadowOpacity: 0.4 }
                ]}
            >
                <View style={styles.cardInner}>
                    {/* Header row */}
                    <View style={styles.cardHeaderRow}>
                        {/* Icon badge */}
                        <View style={[styles.cardIconBadge, { backgroundColor: badgeBg }]}>
                            <Ionicons
                                name={
                                    totalItems === 0
                                        ? 'document-text-outline'
                                        : totalItems < 5
                                            ? 'leaf-outline'
                                            : totalItems < 15
                                                ? 'flame-outline'
                                                : 'ribbon-outline'
                                }
                                size={18}
                                color={badgeColor}
                            />
                        </View>

                        <View style={styles.cardTitleBlock}>
                            <View style={styles.titleEditRow}>
                                <Text style={[styles.cardTitle, { color: DESIGN.textPrimary }]} numberOfLines={1}>{item.title}</Text>
                                <TouchableOpacity
                                    style={styles.renameBtn}
                                    onPress={() => onRename(item.id, item.title)}
                                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                >
                                    <Ionicons name="pencil-outline" size={13} color={DESIGN.textMuted} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.metaRow}>
                                <View style={[styles.metaPill, { backgroundColor: DESIGN.pill }]}>
                                    <Ionicons name="layers-outline" size={11} color={DESIGN.textMuted} />
                                    <Text style={[styles.metaText, { color: DESIGN.textMuted }]}>{tierCount} tiers</Text>
                                </View>
                                <View style={[styles.metaPill, { marginLeft: 6, backgroundColor: DESIGN.pill }]}>
                                    <Ionicons name="grid-outline" size={11} color={DESIGN.textMuted} />
                                    <Text style={[styles.metaText, { color: DESIGN.textMuted }]}>{totalItems} items</Text>
                                </View>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[
                                styles.menuBtn,
                                { backgroundColor: DESIGN.surface, borderColor: DESIGN.border },
                                isMenuOpen && { backgroundColor: DESIGN.accentSoft, borderColor: DESIGN.accent }
                            ]}
                            onPress={() => onMenuPress(item.id)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={isMenuOpen ? 'close' : 'ellipsis-horizontal'}
                                size={18}
                                color={isMenuOpen ? DESIGN.accent : DESIGN.textSecondary}
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Mini tier preview */}
                    {!isMenuOpen && item.rows.length > 0 && (
                        <View style={styles.tierPreview}>
                            {item.rows.slice(0, 5).map((row: any, index: number) => {
                                const rowColor = row.color || DESIGN.accent;
                                return (
                                    <View
                                        key={row.id || index}
                                        style={[
                                            styles.tierPreviewBar,
                                            {
                                                backgroundColor: `${rowColor}`,
                                                borderColor: `${rowColor}60`,
                                                flex: 1,
                                            },
                                        ]}
                                    >
                                        <Text style={[styles.tierPreviewLabel, { color: "#000" }]}>
                                            {row.label || '—'}
                                        </Text>
                                    </View>
                                );
                            })}
                        </View>
                    )}

                    {/* Action menu */}
                    {isMenuOpen && (
                        <View style={[styles.actionMenu, { borderTopColor: DESIGN.cardBorder }]}>
                            <ActionButton
                                icon="pencil"
                                label="Edit"
                                color={DESIGN.accent}
                                bg={DESIGN.accentSoft}
                                onPress={() => navigation.navigate('CreateTier', { id: item.id })}
                            />
                            <ActionButton
                                icon="share-social-outline"
                                label="Share"
                                color={DESIGN.cyan}
                                bg={DESIGN.cyanSoft}
                                onPress={() => onShare(item)}
                            />
                            <ActionButton
                                icon="download-outline"
                                label="Save"
                                color={DESIGN.green}
                                bg={DESIGN.greenSoft}
                                onPress={() => Alert.alert('Save', 'Coming soon!')}
                            />
                            <ActionButton
                                icon="trash-outline"
                                label="Delete"
                                color={DESIGN.red}
                                bg={DESIGN.redSoft}
                                onPress={() => onDelete(item.id)}
                            />
                        </View>
                    )}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

const ActionButton = ({ icon, label, color, bg, onPress }: any) => (
    <TouchableOpacity style={[styles.actionBtn, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.75}>
        <View style={[styles.actionBtnIcon, { borderColor: `${color}30` }]}>
            <Ionicons name={icon} size={20} color={color} />
        </View>
        <Text style={[styles.actionBtnLabel, { color }]}>{label}</Text>
    </TouchableOpacity>
);

// ─── HomeScreen ────────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }: any) => {
    const dispatch = useDispatch();
    const tierLists = useSelector((state: RootState) => state.tier.tierLists);
    const theme = useSelector((state: RootState) => state.tier.theme);
    const isDarkMode = theme === 'dark';
    const DESIGN = getDesignTokens(theme);

    const [searchQuery, setSearchQuery] = useState('');
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

    const filteredLists = useMemo(() => {
        if (!searchQuery.trim()) return tierLists;
        return tierLists.filter(list =>
            list.title.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [tierLists, searchQuery]);

    const handleCreateNew = () => {
        const newId = Date.now().toString();
        dispatch(createNewList({ id: newId, title: 'New Tier List' }));
        navigation.navigate('CreateTier', { id: newId });
    };

    const handleRenameTitle = (id: string, currentTitle: string) => {
        if (Platform.OS === 'ios') {
            Alert.prompt(
                'Rename List',
                'Enter a new name for your tier list',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Rename',
                        onPress: (newTitle) => {
                            if (newTitle?.trim()) dispatch(renameList({ id, title: newTitle.trim() }));
                        },
                    },
                ],
                'plain-text',
                currentTitle
            );
        } else {
            Alert.alert('Rename List', 'Use the edit screen to rename on Android.', [{ text: 'OK' }]);
        }
    };

    const handleMenuPress = (id: string) => {
        setActiveMenuId(activeMenuId === id ? null : id);
    };

    const confirmDelete = (id: string) => {
        Alert.alert('Delete List', 'Are you sure you want to delete this tier list?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', onPress: () => { dispatch(deleteList(id)); setActiveMenuId(null); }, style: 'destructive' },
        ]);
    };

    const handleShare = async (item: TierList) => {
        try {
            await Share.share({ message: `Check out my Tier List: ${item.title}` });
        } catch (error) {
            console.error(error);
        }
    };

    const totalRanked = tierLists.reduce(
        (acc, list) => acc + list.rows.reduce((a: number, r: any) => a + r.items.length, 0),
        0
    );

    return (
        <SafeAreaView style={[styles.root, { backgroundColor: DESIGN.bg }]}>
            <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} backgroundColor={DESIGN.bg} />

            {/* ── Header ── */}
            <View style={[styles.header, { backgroundColor: DESIGN.bg, borderBottomColor: DESIGN.border }]}>
                <View style={styles.headerLeft}>
                    <View style={styles.logoMark}>
                        <Text style={styles.logoMarkText}>T</Text>
                    </View>
                    <View>
                        <Text style={[styles.appName, { color: DESIGN.textPrimary }]}>TierUP</Text>
                        <Text style={[styles.appTagline, { color: DESIGN.textMuted }]}>Rank everything</Text>
                    </View>
                </View>

                <View style={styles.headerRight}>
                    <TouchableOpacity
                        style={[styles.headerIconBtn, { backgroundColor: DESIGN.surface, borderColor: DESIGN.border }]}
                        onPress={() => navigation.navigate('Premium')}
                    >
                        <Ionicons name="diamond-outline" size={20} color={DESIGN.accent} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.headerIconBtn, { backgroundColor: DESIGN.surface, borderColor: DESIGN.border }]}
                        onPress={() => navigation.navigate('Settings')}
                    >
                        <Ionicons name="settings-outline" size={20} color={DESIGN.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.fabSmall} onPress={handleCreateNew}>
                        <Ionicons name="add" size={22} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Stats strip ── */}
            <View style={[styles.statsStrip, { backgroundColor: DESIGN.surface, borderBottomColor: DESIGN.border }]}>
                <View style={styles.statChip}>
                    <Text style={styles.statValue}>{tierLists.length}</Text>
                    <Text style={[styles.statLabel, { color: DESIGN.textMuted }]}>Lists</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: DESIGN.border }]} />
                <View style={styles.statChip}>
                    <Text style={styles.statValue}>{totalRanked}</Text>
                    <Text style={[styles.statLabel, { color: DESIGN.textMuted }]}>Ranked</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: DESIGN.border }]} />
                <View style={styles.statChip}>
                    <Text style={[styles.statValue, { color: DESIGN.green }]}>
                        {tierLists.length > 0 ? '↑' : '—'}
                    </Text>
                    <Text style={[styles.statLabel, { color: DESIGN.textMuted }]}>Active</Text>
                </View>
            </View>

            {/* ── Search ── */}
            <View style={styles.searchWrapper}>
                <View style={[styles.searchBox, { backgroundColor: DESIGN.surface, borderColor: DESIGN.border }]}>
                    <Ionicons name="search-outline" size={17} color={DESIGN.textMuted} />
                    <TextInput
                        style={[styles.searchInput, { color: DESIGN.textPrimary }]}
                        placeholder="Search lists…"
                        placeholderTextColor={DESIGN.textMuted}
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                            <Ionicons name="close-circle" size={16} color={DESIGN.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* ── Section label ── */}
            <View style={styles.sectionHeader}>
                <Text style={[styles.sectionLabel, { color: DESIGN.textSecondary }]}>
                    {searchQuery ? `Results for "${searchQuery}"` : 'My Lists'}
                </Text>
                <Text style={[styles.sectionCount, { color: DESIGN.textMuted, backgroundColor: DESIGN.surface, borderColor: DESIGN.border }]}>{filteredLists.length}</Text>
            </View>

            {/* ── List ── */}
            <DraggableFlatList
                data={filteredLists}
                onDragEnd={({ data }) => dispatch(reorderLists(data))}
                keyExtractor={(item) => item.id}
                activationDistance={20}
                contentContainerStyle={styles.listContent}
                renderItem={({ item, drag, isActive }: RenderItemParams<TierList>) => (
                    <ScaleDecorator>
                        <AnimatedCard
                            item={item}
                            drag={drag}
                            isActive={isActive}
                            isMenuOpen={activeMenuId === item.id}
                            onPress={() => navigation.navigate('CreateTier', { id: item.id })}
                            onMenuPress={handleMenuPress}
                            onRename={handleRenameTitle}
                            onShare={handleShare}
                            onDelete={confirmDelete}
                            navigation={navigation}
                            DESIGN={DESIGN}
                        />
                    </ScaleDecorator>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <View style={[styles.emptyIconRing, { backgroundColor: DESIGN.surface, borderColor: DESIGN.border }]}>
                            <Ionicons name="list-outline" size={38} color={DESIGN.textMuted} />
                        </View>
                        <Text style={[styles.emptyTitle, { color: DESIGN.textPrimary }]}>
                            {searchQuery ? 'No results found' : 'No lists yet'}
                        </Text>
                        <Text style={[styles.emptyBody, { color: DESIGN.textMuted }]}>
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Create your first tier list and start ranking'}
                        </Text>
                        {!searchQuery && (
                            <TouchableOpacity style={styles.emptyCreateBtn} onPress={handleCreateNew} activeOpacity={0.85}>
                                <Ionicons name="add" size={18} color="#fff" />
                                <Text style={styles.emptyCreateText}>Create List</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                }
            />
        </SafeAreaView>
    );
};

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 12 : 4,
        paddingBottom: 14,
        borderBottomWidth: 1,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    logoMark: {
        width: 38,
        height: 38,
        borderRadius: 11,
        backgroundColor: '#7C5CFC', // Static primary
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7C5CFC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 8,
    },
    logoMarkText: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '900',
        letterSpacing: -1,
    },
    appName: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    appTagline: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: -2,
        letterSpacing: 0.3,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerIconBtn: {
        width: 36,
        height: 36,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fabSmall: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: '#7C5CFC',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#7C5CFC',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.45,
        shadowRadius: 8,
        elevation: 6,
    },

    // Stats
    statsStrip: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderBottomWidth: 1,
    },
    statChip: {
        flex: 1,
        alignItems: 'center',
    },
    statValue: {
        color: '#7C5CFC',
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 1,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statDivider: {
        width: 1,
        height: 28,
    },

    // Search
    searchWrapper: {
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 4,
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 44,
        borderWidth: 1,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
    },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 8,
    },
    sectionLabel: {
        fontSize: 13,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    sectionCount: {
        fontSize: 13,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        borderWidth: 1,
    },

    // List
    listContent: {
        padding: 16,
        paddingBottom: 60,
    },

    // Card
    card: {
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 1,
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    cardInner: {
        padding: 16,
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    cardIconBadge: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardTitleBlock: {
        flex: 1,
    },
    titleEditRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: -0.3,
        flexShrink: 1,
    },
    renameBtn: {
        padding: 4,
    },
    metaRow: {
        flexDirection: 'row',
        marginTop: 5,
    },
    metaPill: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        borderRadius: 6,
        paddingHorizontal: 7,
        paddingVertical: 3,
    },
    metaText: {
        fontSize: 11,
        fontWeight: '600',
    },
    menuBtn: {
        width: 34,
        height: 34,
        borderRadius: 9,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Tier preview
    tierPreview: {
        flexDirection: 'row',
        gap: 4,
        marginTop: 14,
        height: 28,
    },
    tierPreviewBar: {
        borderRadius: 6,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minWidth: 28,
    },
    tierPreviewLabel: {
        fontSize: 11,
        fontWeight: '800',
        letterSpacing: 0.5,
    },

    // Action menu
    actionMenu: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 14,
        paddingTop: 14,
        borderTopWidth: 1,
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    actionBtnIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    actionBtnLabel: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // Empty state
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
        paddingHorizontal: 40,
    },
    emptyIconRing: {
        width: 80,
        height: 80,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 8,
        letterSpacing: -0.3,
    },
    emptyBody: {
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
        fontWeight: '500',
        marginBottom: 28,
    },
    emptyCreateBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#7C5CFC',
        paddingHorizontal: 24,
        paddingVertical: 13,
        borderRadius: 12,
        shadowColor: '#7C5CFC',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.45,
        shadowRadius: 12,
        elevation: 8,
    },
    emptyCreateText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '800',
        letterSpacing: -0.2,
    },
});

export default HomeScreen;
