/**
 * starts at { 0, 0 } and returns the next x,y value required for a spiral pattern
 */
export const SpiralFormationIterator = (spacing) => {
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = -1;
  
  const nextValue = () => {
    const currentValue = { x, y };
    
    // Determine the next direction
    if (x === y || (x < 0 && x === -y) || (x > 0 && x === 1 - y)) {
      // Change direction to the right
      const temp = dx;
      dx = -dy;
      dy = temp;
    }
    
    // Update the position
    x += dx;
    y += dy;

    return { x: currentValue.x * spacing, y: currentValue.y * spacing };
  }

  return { nextValue };
}

export const CrossFormationIterator = (spacing) => {
  let x = 0;
  let y = 0;

  const nextValue = () => {
    if (x === 0 && y !== 0) {
      x = y;
      y = 0;
    } else if (x < 0) {
      y = -1 * (x - 1);
      x = 0;
    } else {
      y = -1 * (x + 1);
      x = 0;
    }

    return { x: x * spacing, y: y * spacing };
  }

  return { nextValue }
}


// u, r, d, l, u, r, d, l, u ...
// 1, 1, 2, 2, 3, 3, 4, 4, 5 ...

// y + 1, x + 1, y - 2, x - 2,

/**
  * 
  */

// { y: 0, x: 0 } y + 1
// { y: 1, x: 0 } x + 1
// { y: 1, x: 1 } y - 1
// { y: 0, x: 1 } y - 1
// { y: -1, x: 1 } x - 1
// { y: -1, x: 0 } x - 1
// { y: -1, x: -1 } y + 1
// { y: 0, x: -1 } y + 1
// { y: 1, x: -1 } y + 1
// { y: 2, x: -1 }
// 

// 1 unit = skeleton width / height (let's go with 50 for now)

// make each skeleton 
// * * * * *
// * * * * *
// * * ^ * *
// * * * * *
// * * * * *
/**
  * 0,0
  * 0,1
  * 1,1
  * 1,0
  * 1,-1
  * 0,-1,
  * -1,-1,
  * -1,0
  * -1,1,
  * -1,2
  */