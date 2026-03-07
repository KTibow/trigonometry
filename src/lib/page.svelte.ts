const product = $state({
  page: '',
  detail: '',
});

const process = () => {
  let hash = location.hash;
  if (hash.startsWith('#')) hash = hash.slice(1);
  const [page, detail] = hash.split('/');
  product.page = page || '';
  product.detail = detail || '';
};
process();
window.addEventListener('hashchange', () => {
  process();
});

export default product;
