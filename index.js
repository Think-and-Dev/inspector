import Search from './src/search.js';

console.log('Welcome to the search!!\n')
const search = new Search()
search.searchEvents().catch(console.dir);
