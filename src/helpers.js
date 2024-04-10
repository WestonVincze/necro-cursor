export const normalizeForce = ({ x, y }) => {
  if (x === 0 && y === 0) return { x, y };

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

export const getRandomElements = (array, count) => {
  if (count > array.length) return false;

  const randomElements = [];

  while (randomElements.length < count) {
    const randomIndex = Math.floor(Math.random() * array.length);

    if (!randomElements.includes(array[randomIndex])) {
      randomElements.push(array[randomIndex]);
    }
  }

  return randomElements;
}

export const getClosestUnit = ({ x, y }, units) => {
  let closestDistanceSq = Infinity;
  let closestUnit = null;
  units.forEach(unit => {
    const distance = (x - unit.sprite.x) ** 2 + (y - unit.sprite.y) ** 2;
    if (distance < closestDistanceSq) {
      closestUnit = unit;
      closestDistanceSq = distance;
    }
  })

  return closestUnit;
}

const getFirstUnitWithin = (position, range) => {}
