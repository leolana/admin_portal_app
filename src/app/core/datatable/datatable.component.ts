import { Input, Component, OnInit } from '@angular/core';
import { Datatable } from './datatable.interface';

@Component({
    selector: 'alpe-datatable',
    templateUrl: './datatable.component.html'
})
export class AlpeDatatableComponent implements OnInit {
    constructor() { }

    // PROPERTIES
    @Input() datatable: Datatable<any>;
    columns: string[] = [];
    fnCheckboxes: any[] = [];

    // METHODS
    ngOnInit() {
        this.loadDefaults();
    }

    onMatPaginatorChange(event: any) {
        this.datatable.internal.pageIndex = event.pageIndex;
        this.datatable.internal.pageSize = event.pageSize;
        this.datatable.updateVisibleData();
    }

    onMatSortChange(event: any) {
        this.datatable.internal.sortColumn = event.active;
        this.datatable.internal.sortOrder = event.direction;
        this.datatable.updateVisibleData();
    }

    loadDefaults() {
        if (!this.datatable.internal.hasOwnProperty('pageSize')) {
            this.datatable.internal.pageSize = 10;
        }
        if (!this.datatable.internal.hasOwnProperty('pageSizeOptions')) {
            this.datatable.internal.pageSizeOptions = [10, 50, 100];
        }
        if (!this.datatable.internal.hasOwnProperty('pageIndex')) {
            this.datatable.internal.pageIndex = 0;
        }
        if (!this.datatable.internal.hasOwnProperty('sortFunctionAsc')) {
            this.datatable.internal.sortFunctionAsc = (x, y, key) => {
                const val_x = x[key];
                const val_y = y[key];

                if (val_x == val_y) return 0;
                if (val_x < val_y) return -1;
                return 1;
            };
        }
        if (!this.datatable.internal.hasOwnProperty('serverSide')) {
            this.datatable.internal.serverSide = (pageSize, pageIndex, sortColumn, sortOrder) => {
                const data = this.datatable.internal.data;

                if (sortColumn) {
                    const asc = sortOrder === 'asc';

                    data.sort((x, y) => {
                        let order = this.datatable.internal.sortFunctionAsc(x, y, sortColumn);

                        if (!asc) {
                            order *= -1;
                        }
                        return order;
                    });
                }

                const slicedData = data.slice(
                    pageIndex * pageSize,
                    Math.min(data.length, pageSize * (pageIndex + 1))
                );

                this.datatable.internal.visibleData = slicedData;
            };
        }

        this.datatable.internal.table.forEach(item => {
            if (item.buttons) {
                item.disableSort = true;
                item.buttons.forEach(button => button.visible = button.visible || (() => true));
            }
            if (item.checkbox) {
                this.fnCheckboxes.push((row) => item.checkbox.canCheck(row));
                this.selectAllRows(item, item.checkbox.isAllChecked);
            }
        });

        this.columns = this.datatable.internal.table.map(x => x.property);
        this.datatable.internal.initialized = true;

        this.datatable.updateVisibleData();
    }

    changeYesOrNo(fn, row, property) {
        row[property] = !row[property];
        fn(row);
    }

    selectRow(item, row) {
        row[item.property] = !row[item.property];
        item.checkbox.onCheck(row);
    }

    selectAllRows(item, check: boolean) {
        item.checkbox.isAllChecked = check;

        this.datatable.internal.data.forEach((row) => {
            if (item.checkbox.canCheck(row)) {
                row[item.property] = item.checkbox.isAllChecked;
            }
        });

        item.checkbox.onThCheck();
    }

    rowBlocked(row: any) {
        return this.fnCheckboxes.some(isOk => !isOk(row));
    }

    rowClasses(row: any): string {
        const classNames = [];

        if (typeof this.datatable.internal.rowClasses === 'function') {
            classNames.push(this.datatable.internal.rowClasses(row) || '');
        }

        if (this.rowBlocked(row)) {
            classNames.push('campos-invalidos');
        }

        return classNames.join(' ');
    }

    inputNumberChanged(event, row, item) {
        row[item.property] = event.target.value;
        item.inputNumber.valueChange(row);
    }

    clickBtnGroup(row: any, col: any, value: any) {
        if (row[col.property] === value) return;
        row[col.property] = value;
        col.groupButtonToggle.fnBotaoClicked(value);
    }
}
