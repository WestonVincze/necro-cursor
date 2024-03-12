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

const DiamondFormationIterator = () => {
  /*

      *
    * * *
  * * * * *
    * * *
      *

   */

}

export const RandomFormationIterator = () => {
  let x = 0;
  let y = 0;
  let distance = 200;


  const nextValue = () => {
    x = Math.random() * distance * (Math.random() > 0.5 ? -1 : 1);
    y = Math.random() * distance * (Math.random() > 0.5 ? -1 : 1);

    distance += 25;
    return { x, y }
  }

  return { nextValue }
}

export const TriangleFormationIterator = (length) => {
  if (length <= 1) return { x: 0, y: 0 };
  // will need to know size to calculate rows
  // rows = length 
  // 1, 2, 3, 4, 5, 6
  const rows = Math.ceil((-1 + Math.sqrt(1 + 8 * length)) / 2)
  console.log(rows)

  /* gets the number of cols in the last row */
  const remainder = (rows - 1) * rows / 2;
  const lastRowCount = length - remainder;
  /**
   * length of 9
   * 4 rows
   * 
   * each col has a size equal to the row number
   * 
   * iterate through rows
   * row 1 -> col 1
   * row 2 -> col 1, col 2
   * row 3 -> col 1, col 2, col 3
   * row 4 -> col 1, col 2, col 3, col 4 (on last row, we'll need to confirm that it's actually "full" somehow)
   * 
   * 
   * nextValue gives:
   * 0, 1.5
   * 
   * 0.5, 0.5
   * -0.5, 0.5
   * 
   * 1, -0.5
   * 0, -0.5
   * -1, -0.5
   * 
   * , - 1.5
   * , - 1.5
   * , - 1.5
   * , - 1.5
   * 
   */


  // row number will create an offset... 
  /*
  1 row  = 0 offset
  2 rows = row 1 = 0.5, row 2 = -0.5
  3 rows = row 1 = 1, row 2 = 0, row 3 = -1
  4 rows = row 1 = 1.5, row 2 = 0.5, row 3 = -0.5 row 4 = -1.5
  5 rows = row 1 = 2, row 2 = 1, row 3 = 0, row 4 = -1, row 5 = -2
  */

  // cols will also have offsets depending on their length...
  /*
  1 col  = 0
  2 cols = col 1 = 0.5, col 2 = -0.5
  3 cols = col 1 = 1, col 2 = 0, col 3 = -1
  ...
  */


  /*
  height = rows
  length = cols

  */


  console.log(rows)
  console.log(lastRowCount)
  /* crude triangle print, lol */
  for (let i = 1; i <= rows; i++) {
    let stars = ""
    for (let j = 1; j <= i; j++) {
      if (i === rows && j > lastRowCount) stars += "o";
      else stars += "*"
    }
    console.log(stars + '\n')
  }
}

// instead of simply getting next value, have all offsets pre-determined whenever the size changes and then
// "lock" the next value until a fullfillment is made. All skeletons will be assigned the same "locked" value, except those
// who have made fulfillments.
// example:
/*
offsets
[ {0, 0}, {0, 1}, {1, 1} ]
next value will return {0,0}
all minions get {0,0} as the offset until a minion reaches that point
once it's reached, that minion is assigned the offset and the rest are given
the next value. 

process repeats whenever a minion leaves their target (trigger reset)

*/

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