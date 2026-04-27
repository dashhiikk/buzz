import { useCallback, useLayoutEffect, useState } from "react";

const HIDDEN_STYLE = {
  position: "fixed",
  top: -9999,
  left: -9999,
  visibility: "hidden",
};

export default function useAnchoredPortalPosition({
  isOpen,
  anchorRef,
  contentRef,
  offset = 6,
  margin = 8,
  zIndex = 2000,
}) {
  const [style, setStyle] = useState(HIDDEN_STYLE);

  const updatePosition = useCallback(() => {
    const anchor = anchorRef?.current;
    const content = contentRef?.current;

    if (!isOpen || !anchor || !content) {
      return;
    }

    const anchorRect = anchor.getBoundingClientRect();
    const contentRect = content.getBoundingClientRect();

    let left = anchorRect.left + anchorRect.width / 2 - contentRect.width / 2;
    let top = anchorRect.bottom + offset;

    const maxLeft = window.innerWidth - contentRect.width - margin;
    const maxTop = window.innerHeight - contentRect.height - margin;

    left = Math.min(left, maxLeft);
    left = Math.max(left, margin);

    top = Math.min(top, maxTop);
    top = Math.max(top, margin);

    setStyle({
      position: "fixed",
      top,
      left,
      zIndex,
    });
  }, [anchorRef, contentRef, isOpen, margin, offset, zIndex]);

  useLayoutEffect(() => {
    if (!isOpen) {
      setStyle(HIDDEN_STYLE);
      return;
    }

    updatePosition();

    const frameId = window.requestAnimationFrame(updatePosition);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isOpen, updatePosition]);

  return style;
}
