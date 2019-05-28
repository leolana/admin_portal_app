export interface IDatatable<Item> {
    table: {
        property: string,
        description: string,
        pipe?: 'date' | 'currency' | 'dateTime' | 'noSymbolCurrency',
        disableSort?: boolean,
        hideMobileLabel?: boolean,
        hideSort?: boolean,
        classProperty?: string,
        buttons?: {
            btnClass?: string,
            iconClass?: string,
            text?: string,
            notVisibleMessage?: string;
            visible?: (item: Item) => boolean;
            fnAction: (item: Item) => any;
        }[],
        inputNumber?: {
            max?: number,
            min?: number,
            valueChange: (item: Item) => any,
            label: (item: Item) => any
        },
        checkbox?: {
            isAllChecked: boolean,
            canCheck: (item: Item) => any,
            onThCheck: () => any,
            onCheck: (item: Item) => any
        },
        slideToggle?: {
            labelClass?: string,
            textTrue?: string,
            textFalse?: string,
            disableSlideToggle?: boolean,
            changeSlideToggle?: (item: Item) => any
        },
        groupButtonToggle?: {
            buttons: {
                text?: string,
                value?: any
            }[],
            fnBotaoClicked?: (item: Item) => any
        }
    }[];
    data: Item[];
    visibleData?: Item[];
    pageSizeOptions?: number[];

    rowClasses?: (item: Item) => string;

    pageSize?: number;
    pageIndex?: number;
    sortColumn?: string;
    sortOrder?: 'asc' | 'desc';

    serverSide?: (
        pageSize: number,
        pageIndex: number,
        sortColumn: string,
        sortOrder: 'asc' | 'desc',
    ) => void;

    sortFunctionAsc?: (
        item1: Item,
        item2: Item,
        propertyName: string,
    ) => 1 | 0 | -1;

    initialized?: boolean;
}

export class Datatable<Item> {
    constructor(
        public internal: IDatatable<Item>,
    ) { }

    updateData(data: Item[]) {
        if (this.internal.initialized) {
            this.internal.data = data;
            this.updateVisibleData();
        }
    }

    updateVisibleData() {
        this.internal.serverSide(
            this.internal.pageSize,
            this.internal.pageIndex,
            this.internal.sortColumn,
            this.internal.sortOrder
        );
    }

    any(): boolean {
        return this.internal.data.length > 0;
    }
}
