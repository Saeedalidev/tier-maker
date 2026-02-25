import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TierItem {
    id: string;
    imageUri?: string;
    text?: string;
    backgroundColor?: string;
}

export interface TierRow {
    id: string;
    label: string;
    color: string;
    items: TierItem[];
    labelImageUri?: string;
}

export interface TierList {
    id: string;
    title: string;
    rows: TierRow[];
    unrankedItems: TierItem[];
}

interface TierState {
    tierLists: TierList[];
    currentTierListId: string | null;
    theme: 'dark' | 'light';
}

const initialState: TierState = {
    tierLists: [],
    currentTierListId: null,
    theme: 'light',
};

const defaultRows: TierRow[] = [
    { id: 'S', label: 'S', color: '#E52222', items: [] },
    { id: 'A', label: 'A', color: '#F5952C', items: [] },
    { id: 'B', label: 'B', color: '#CFCF1F', items: [] },
    { id: 'C', label: 'C', color: '#7FDB23', items: [] },
    { id: 'D', label: 'D', color: '#5C65E0', items: [] },
];

export const tierSlice = createSlice({
    name: 'tier',
    initialState,
    reducers: {
        createNewList: (state, action: PayloadAction<{ id: string; title: string }>) => {
            const newList: TierList = {
                id: action.payload.id,
                title: action.payload.title,
                rows: JSON.parse(JSON.stringify(defaultRows)),
                unrankedItems: [],
            };
            state.tierLists.push(newList);
            state.currentTierListId = newList.id;
        },
        setCurrentList: (state, action: PayloadAction<string>) => {
            state.currentTierListId = action.payload;
        },
        addItemToUnranked: (state, action: PayloadAction<TierItem>) => {
            const currentList = state.tierLists.find(l => l.id === state.currentTierListId);
            if (currentList) {
                currentList.unrankedItems.push(action.payload);
            }
        },
        deleteItem: (state, action: PayloadAction<{ itemId: string, rowId: string | 'unranked' }>) => {
            const currentList = state.tierLists.find(l => l.id === state.currentTierListId);
            if (!currentList) return;

            const { itemId, rowId } = action.payload;

            if (rowId === 'unranked') {
                currentList.unrankedItems = currentList.unrankedItems.filter(i => i.id !== itemId);
            } else {
                const row = currentList.rows.find(r => r.id === rowId);
                if (row) {
                    row.items = row.items.filter(i => i.id !== itemId);
                }
            }
        },
        moveItem: (
            state,
            action: PayloadAction<{
                fromRowId: string | 'unranked';
                toRowId: string | 'unranked';
                itemId: string;
                targetIndex?: number;
            }>
        ) => {
            const currentList = state.tierLists.find(l => l.id === state.currentTierListId);
            if (!currentList) return;

            const { fromRowId, toRowId, itemId, targetIndex } = action.payload;

            let itemToMove: TierItem | undefined;

            // Extract item
            if (fromRowId === 'unranked') {
                const index = currentList.unrankedItems.findIndex(i => i.id === itemId);
                if (index > -1) {
                    itemToMove = currentList.unrankedItems.splice(index, 1)[0];
                }
            } else {
                const row = currentList.rows.find(r => r.id === fromRowId);
                if (row) {
                    const index = row.items.findIndex(i => i.id === itemId);
                    if (index > -1) {
                        itemToMove = row.items.splice(index, 1)[0];
                    }
                }
            }

            // Place item
            if (itemToMove) {
                if (toRowId === 'unranked') {
                    if (typeof targetIndex === 'number') {
                        currentList.unrankedItems.splice(targetIndex, 0, itemToMove);
                    } else {
                        currentList.unrankedItems.push(itemToMove);
                    }
                } else {
                    const row = currentList.rows.find(r => r.id === toRowId);
                    if (row) {
                        if (typeof targetIndex === 'number') {
                            row.items.splice(targetIndex, 0, itemToMove);
                        } else {
                            row.items.push(itemToMove);
                        }
                    }
                }
            }
        },
        deleteRow: (state, action: PayloadAction<string>) => {
            const currentList = state.tierLists.find(l => l.id === state.currentTierListId);
            if (currentList) {
                const rowIndex = currentList.rows.findIndex(r => r.id === action.payload);
                if (rowIndex > -1) {
                    const row = currentList.rows[rowIndex];
                    // Move items to unranked
                    currentList.unrankedItems.push(...row.items);
                    // Remove row
                    currentList.rows.splice(rowIndex, 1);
                }
            }
        },
        updateRow: (state, action: PayloadAction<{ rowId: string; label: string; color: string; labelImageUri?: string }>) => {
            const currentList = state.tierLists.find(l => l.id === state.currentTierListId);
            if (currentList) {
                const row = currentList.rows.find(r => r.id === action.payload.rowId);
                if (row) {
                    row.label = action.payload.label;
                    row.color = action.payload.color;
                    row.labelImageUri = action.payload.labelImageUri;
                }
            }
        },
        deleteList: (state, action: PayloadAction<string>) => {
            state.tierLists = state.tierLists.filter(l => l.id !== action.payload);
            if (state.currentTierListId === action.payload) {
                state.currentTierListId = null;
            }
        },
        renameList: (state, action: PayloadAction<{ id: string; title: string }>) => {
            const list = state.tierLists.find(l => l.id === action.payload.id);
            if (list) {
                list.title = action.payload.title;
            }
        },
        addRow: (state, action: PayloadAction<{ label: string; color: string; labelImageUri?: string }>) => {
            const currentList = state.tierLists.find(l => l.id === state.currentTierListId);
            if (currentList) {
                currentList.rows.push({
                    id: Date.now().toString(),
                    label: action.payload.label,
                    color: action.payload.color,
                    labelImageUri: action.payload.labelImageUri,
                    items: []
                });
            }
        },
        updateTitle: (state, action: PayloadAction<string>) => {
            const currentList = state.tierLists.find(l => l.id === state.currentTierListId);
            if (currentList) {
                currentList.title = action.payload;
            }
        },
        clearList: (state) => {
            const currentList = state.tierLists.find(l => l.id === state.currentTierListId);
            if (currentList) {
                // Return all items to unranked
                const allItems: TierItem[] = [];
                currentList.rows.forEach(row => {
                    allItems.push(...row.items);
                    row.items = [];
                });
                currentList.unrankedItems.push(...allItems);
            }
        },
        reorderLists: (state, action: PayloadAction<TierList[]>) => {
            state.tierLists = action.payload;
        },
        reorderRows: (state, action: PayloadAction<{ listId: string; rows: TierRow[] }>) => {
            const currentList = state.tierLists.find(l => l.id === action.payload.listId);
            if (currentList) {
                currentList.rows = action.payload.rows;
            }
        },
        reorderUnrankedItems: (state, action: PayloadAction<{ listId: string; items: TierItem[] }>) => {
            const currentList = state.tierLists.find(l => l.id === action.payload.listId);
            if (currentList) {
                currentList.unrankedItems = action.payload.items;
            }
        },
        toggleTheme: (state) => {
            state.theme = state.theme === 'dark' ? 'light' : 'dark';
        }
    },
});

export const {
    createNewList,
    setCurrentList,
    addItemToUnranked,
    deleteItem,
    deleteRow,
    moveItem,
    updateRow,
    addRow,
    updateTitle,
    renameList,
    deleteList,
    clearList,
    reorderLists,
    reorderRows,
    reorderUnrankedItems,
    toggleTheme
} = tierSlice.actions;
export default tierSlice.reducer;
