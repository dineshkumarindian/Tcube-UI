
export function tablePaginationOption(event: number) {
    let pageSize = event;
    let pageSizeValue: number[] = [10, 25, 50, 100];
    let pageMaxSizeValue: number = 100;
    let pagefixedPaginationSize: number[];
    if (pageSize > pageMaxSizeValue) {
        while (pageSize > pageMaxSizeValue) {
            pageMaxSizeValue = pageMaxSizeValue + 50;
            pageSizeValue.push(pageMaxSizeValue);
        }
        pagefixedPaginationSize = pageSizeValue;
    } else {
        pagefixedPaginationSize = pageSizeValue;
    }
    return pagefixedPaginationSize;

}