export const composePage = (dataArray, pageSize, pageNo) => dataArray.slice(pageNo * pageSize, pageNo * pageSize + pageSize);

export const calcTotalPages = (dataArray, pageSize) => Math.ceil(dataArray.length / pageSize);


