export async function promiseAllInBatches(task, items, batchSize, ...extraParams) {
 let position = 0;
 let results = [];
 while (position < items.length) {
  const itemsForBatch = items.slice(position, position + batchSize);
  const resultsn = await Promise.allSettled(itemsForBatch.map(item => task(item, ...extraParams)));
  results = [...results, ...resultsn];
  position += batchSize;
 }
 return results;
}
