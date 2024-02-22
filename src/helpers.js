export const normalizeForce = ({ x, y }) => {
  const magnitude = Math.sqrt(x * x + y * y);

  if (magnitude > 0) {
    x /= magnitude;
    y /= magnitude;
  }

  return { x, y }
}

export const getURLParam = (param, defer) => {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  return params.get(param) || defer;
}
