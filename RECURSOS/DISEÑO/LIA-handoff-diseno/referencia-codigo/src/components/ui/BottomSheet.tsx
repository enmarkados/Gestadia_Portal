import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

interface BottomSheetProps {
  children: React.ReactNode;
  className?: string;
  description?: string;
  draggable?: boolean;
  expandable?: boolean;
  footer?: React.ReactNode;
  onClose: () => void;
  title: string;
}

const BOTTOM_SHEET_CLOSE_DRAG_DELTA = 96;
const BOTTOM_SHEET_EXPAND_DRAG_DELTA = 64;
const BOTTOM_SHEET_UPWARD_DRAG_LIMIT = 160;
const BOTTOM_SHEET_NO_DRAG_SELECTOR = [
  'button',
  'a[href]',
  'input',
  'textarea',
  'select',
  '[role="button"]',
  '[contenteditable="true"]',
  '[data-bottom-sheet-no-drag="true"]',
].join(', ');
const BOTTOM_SHEET_DRAG_REGION_SELECTOR = '[data-bottom-sheet-drag-region="true"]';
const BOTTOM_SHEET_HANDLE_SELECTOR = 'button[data-bottom-sheet-drag-region="true"]';

type BottomSheetSnapState = 'peek' | 'expanded';
type BottomSheetDragAction = 'none' | 'expand' | 'collapse' | 'close';

export function shouldCloseBottomSheetDrag(startY: number | null, currentY: number): boolean {
  if (startY === null) return false;
  return Math.max(0, currentY - startY) > BOTTOM_SHEET_CLOSE_DRAG_DELTA;
}

export function resolveBottomSheetDragAction(
  startY: number | null,
  currentY: number,
  isExpanded: boolean,
  expandable: boolean
): BottomSheetDragAction {
  if (startY === null) return 'none';

  const deltaY = currentY - startY;
  if (expandable && !isExpanded && deltaY < -BOTTOM_SHEET_EXPAND_DRAG_DELTA) return 'expand';
  if (shouldCloseBottomSheetDrag(startY, currentY)) return expandable && isExpanded ? 'collapse' : 'close';
  return 'none';
}

export function getBottomSheetDragTranslateY(
  startY: number | null,
  currentY: number,
  isExpanded: boolean,
  expandable: boolean
): number {
  if (startY === null) return 0;

  const deltaY = currentY - startY;
  if (deltaY > 0) return deltaY;
  if (!expandable || isExpanded) return 0;
  return Math.max(deltaY, -BOTTOM_SHEET_UPWARD_DRAG_LIMIT);
}

export function isBottomSheetDragExcludedTarget(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false;
  return Boolean(target.closest(BOTTOM_SHEET_NO_DRAG_SELECTOR));
}

function isBottomSheetDragRegionTarget(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false;
  return Boolean(target.closest(BOTTOM_SHEET_DRAG_REGION_SELECTOR));
}

function isBottomSheetHandleTarget(target: EventTarget | null): boolean {
  if (typeof Element === 'undefined' || !(target instanceof Element)) return false;
  return Boolean(target.closest(BOTTOM_SHEET_HANDLE_SELECTOR));
}

function clearBottomSheetTextSelection(): void {
  if (typeof window === 'undefined') return;
  window.getSelection()?.removeAllRanges();
}

export function BottomSheet({
  children,
  className,
  description,
  draggable = false,
  expandable = false,
  footer,
  onClose,
  title,
}: BottomSheetProps) {
  const titleId = React.useId();
  const dragStartY = React.useRef<number | null>(null);
  const dragDeltaY = React.useRef(0);
  const dragStartedInHandle = React.useRef(false);
  const hasDragged = React.useRef(false);
  const [sheetState, setSheetState] = React.useState<BottomSheetSnapState>('peek');
  const [isDragging, setIsDragging] = React.useState(false);
  const [translateY, setTranslateY] = React.useState(0);
  const canExpand = draggable && expandable;
  const isExpanded = canExpand && sheetState === 'expanded';

  const resetDrag = React.useCallback(() => {
    dragStartY.current = null;
    dragDeltaY.current = 0;
    dragStartedInHandle.current = false;
    hasDragged.current = false;
    setIsDragging(false);
    setTranslateY(0);
  }, []);

  const handleSheetPointerDown = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!draggable) return;
    const startsInHandle = isBottomSheetHandleTarget(event.target);
    if (!startsInHandle && isBottomSheetDragExcludedTarget(event.target)) return;

    const startsInDragRegion = isBottomSheetDragRegionTarget(event.target);
    const startsInPeekContent = canExpand && !isExpanded;
    if (!startsInDragRegion && !startsInPeekContent) return;

    dragStartY.current = event.clientY;
    dragDeltaY.current = 0;
    dragStartedInHandle.current = startsInHandle;
    hasDragged.current = false;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [canExpand, draggable, isExpanded]);

  const handleSheetPointerMove = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!draggable || dragStartY.current === null) return;
    const rawDelta = event.clientY - dragStartY.current;
    if (Math.abs(rawDelta) > 4) {
      hasDragged.current = true;
      event.preventDefault();
      clearBottomSheetTextSelection();
    }
    dragDeltaY.current = rawDelta;
    setTranslateY(getBottomSheetDragTranslateY(dragStartY.current, event.clientY, isExpanded, canExpand));
  }, [canExpand, draggable, isExpanded]);

  const handleSheetPointerUp = React.useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!draggable || dragStartY.current === null) return;
    const wasDragged = hasDragged.current;
    const shouldToggleFromHandleTap = !wasDragged && canExpand && dragStartedInHandle.current;
    const action = resolveBottomSheetDragAction(
      dragStartY.current,
      dragStartY.current + dragDeltaY.current,
      isExpanded,
      canExpand
    );
    resetDrag();
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (wasDragged) {
      clearBottomSheetTextSelection();
    }
    if (shouldToggleFromHandleTap) {
      setSheetState((current) => (current === 'expanded' ? 'peek' : 'expanded'));
      return;
    }
    if (action === 'expand') setSheetState('expanded');
    if (action === 'collapse') setSheetState('peek');
    if (action === 'close') onClose();
  }, [canExpand, draggable, isExpanded, onClose, resetDrag]);

  const handleHandleClick = React.useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) return;
    if (!canExpand) return;
    setSheetState((current) => (current === 'expanded' ? 'peek' : 'expanded'));
  }, [canExpand]);

  const sheetStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    const style: React.CSSProperties = {};
    if (translateY !== 0) style.transform = `translateY(${translateY}px)`;
    if (canExpand && !isExpanded) style.touchAction = 'none';
    if (isDragging) style.userSelect = 'none';
    return Object.keys(style).length > 0 ? style : undefined;
  }, [canExpand, isDragging, isExpanded, translateY]);

  const content = (
    <div
      className="fixed inset-0 z-[210] flex items-end bg-black/50 p-0 md:items-center md:justify-center md:p-4"
      onClick={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-draggable={draggable || undefined}
        data-expanded={isExpanded || undefined}
        onClick={(event) => event.stopPropagation()}
        onPointerDown={handleSheetPointerDown}
        onPointerMove={handleSheetPointerMove}
        onPointerUp={handleSheetPointerUp}
        onPointerCancel={resetDrag}
        style={sheetStyle}
        className={cn(
          'flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-xl motion-safe:lia-bottom-sheet-enter md:max-w-xl md:rounded-2xl md:pb-5',
          draggable && !isDragging && 'transition-transform duration-150 ease-out',
          draggable && 'will-change-transform',
          className,
          canExpand && (isExpanded ? 'h-[92dvh] max-h-[92dvh]' : 'max-h-[58dvh]')
        )}
      >
        {draggable && (
          <button
            type="button"
            aria-label={isExpanded ? 'Contraer panel' : 'Expandir panel'}
            aria-expanded={isExpanded}
            data-bottom-sheet-drag-region="true"
            className="-mt-1 mb-4 flex w-full justify-center md:hidden"
            onClick={handleHandleClick}
            style={{ touchAction: 'none' }}
          >
            <span className="h-1.5 w-12 rounded-full bg-brand-blue-light" />
          </button>
        )}
        <div
          data-bottom-sheet-drag-region="true"
          className="flex shrink-0 items-start justify-between gap-3"
          style={draggable ? { touchAction: 'none' } : undefined}
        >
          <div>
            <h2 id={titleId} className="text-lg font-bold text-brand-navy">{title}</h2>
            {description && <p className="mt-1 text-sm text-brand-gray">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            data-bottom-sheet-no-drag="true"
            className="rounded-full p-2 text-brand-gray transition-colors hover:bg-brand-light focus:outline-none focus:ring-2 focus:ring-brand-gold/35"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-5 min-h-0 flex-1 overflow-y-auto">{children}</div>
        {footer && <div className="mt-4 shrink-0">{footer}</div>}
      </section>
    </div>
  );

  if (typeof document === 'undefined') return content;

  return createPortal(content, document.body);
}
