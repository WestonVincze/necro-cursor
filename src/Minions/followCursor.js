const FollowCursor = (app, sprite) => {
  app.ticker.add(() => {
    const dx = targetX - bunny.x;
    const dy = targetY - bunny.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const directionX = dx / distance;
    const directionY = dy / distance;

    const moveX = directionX * speed;
    const moveY = directionY * speed;
    
    if (bunny.x + 50 < targetX || bunny.x - 50 > targetX) {
      bunny.x += moveX;
    }
    if (bunny.y + 50 < targetY || bunny.y - 50 > targetY) {
      bunny.y += moveY;
    }
  });
}
