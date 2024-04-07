// manages all Overlay Views
// -- is this even useful..?

export const Overlay = () => {
  const _overlay = document.getElementById("overlay");
  let _hidden = true;
  let _currentPage = null;
  let _onChangeOverlay = null;

  const SetOverlay = ({ content, onChangeOverlay }) => {

  }

  const toggleOverlay = () => {
    if (_hidden) {
      _overlay.classList.add("show");
    } else {
      _overlay.classList.remove("show");
    }
  }

  const showOverlayIfHidden = () => {
    if (_hidden) _overlay.classList.add("show");
  }

  return {
    SetOverlay,
    toggleOverlay,
    showOverlayIfHidden,
  }
}
