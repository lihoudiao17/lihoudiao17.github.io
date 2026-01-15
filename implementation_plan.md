# 背景菜单：水平分叉设计 (Horizontal Branching Menu)

## Goal Description
应用户要求及设计草图，将背景菜单的交互从“垂直列表”改为“水平分叉按钮”。
点击顶部的【背景类别】按钮后，下方横向弹出三个子按钮：【山水诗意】【艺术诗魂】【自然诗境】。
此设计类似思维导图的分支，视觉上更直观、大气。

## User Review Required
> [!NOTE]
> 这将完全替换之前的垂直折叠菜单结构。新的子按钮将横向排列在主按钮下方。

## Proposed Changes

### Index.html
- **Container**: Add a wrapper `#bg-branch-group` inside `music-wrapper` for the horizontal buttons.
- **Buttons**: Add 3 buttons inside the wrapper:
    - `#cat-landscape` (山水诗意)
    - `#cat-art` (艺术诗魂)
    - `#cat-nature` (自然诗境)
- **Lists**: Move the `ul.sub-list` items from `bg-list` to be associated with each new button (likely as a dropdown for that specific button).
- **Remove**: The old `#bg-list` structure (we will repurpose its content).

### CSS (css/base.css)
- **#bg-branch-group**:
    - `display: none` (initially hidden).
    - `display: flex` (when shown).
    - `position: absolute`.
    - `top: 100%`.
    - `left: 50%` (transform translate-x -50% to center below main button).
    - `gap: 15px` (spacing between stamps).
- **.branch-btn** (The Seal Buttons):
    - `width: 60px`, `height: 60px`.
    - `border: 2px solid var(--accent-color)`.
    - `border-radius: 4px` (rounded rect for seal look).
    - `background: rgba(255,255,255,0.9)`.
    - `writing-mode: vertical-rl` (vertical text for Chinese seal style).
    - `font-family`: Serif/Kaishu.
    - `box-shadow`: subtle drop shadow.

### CSS Animation (css/base.css)
- **Keyframes**: Define `@keyframes splatter` for the buttons.
    - Start: `opacity: 0`, `transform: translate(-50%, -50%) scale(0.5)` (Start from center/behind main button).
    - End: `opacity: 1`, `transform: translate(0, 0) scale(1)` (End at final flex position).
- **Staggered Delay**: Apply `animation-delay` to each `.branch-item` (1st, 2nd, 3rd) so they don't appear all at once but "sputter" out.
- **Direction**:
    - Center button: Drops straight down.
    - Left button: Moves down-left.
    - Right button: Moves down-right.
    - *Correction*: Since we are using Flexbox, the "movement" is implicitly handled by the layout reflow if we animate `max-width` or `flex-grow`, but for a true "splatter", we might need `transform` animations from a common origin.
    - **Better Approach**: Use `transform: translate` in keyframes.
        - Initial state of `.bg-branch-group`: `pointer-events: none`.
        - When `.show`:
            - Item 1 (Left): `translateX(20px)` -> `translateX(0)` ?
            - Actually, standard `fadeInSlideDown` is too simple. The user wants "sputter/scatter".
            - We will animate `opacity` and `transform` (scale + slight overshoot) to simulate popping out.

### JavaScript (js/script.js)
- No major JS changes needed, just toggling the class. The CSS will handle the animation.

### JavaScript (js/script.js)
- 更新 `bg-btn` 点击事件：显示 Level 2 的横向容器。
- 为新的分类按钮添加点击事件：显示Level 3的具体背景列表。

## Verification Plan
1.  **Layout**: Click "Background Category". Verify 3 buttons appear horizontally below it.
2.  **Action**: Click "Landscape". Verify the list of landscape images appears.
3.  **Selection**: Select an image. Verify background changes and menu closes.
