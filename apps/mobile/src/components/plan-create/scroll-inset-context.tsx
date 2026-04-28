import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";

const FALLBACK_FOOTER_BLOCK_PX = 120;

/** Fade band above footer — keep in sync with shell.tsx gradient height */
export const PLAN_CREATE_FOOTER_FADE_PX = 44;

type PlanCreateScrollInsetContextValue = {
	/** Measured footer column (dots + CTA + horizontal padding + safe area padding) */
	footerBlockHeight: number;
	/** Extra scroll padding so content clears the footer and fade */
	scrollPaddingBottom: number;
	onFooterBlockLayout: (height: number) => void;
};

const PlanCreateScrollInsetContext =
	createContext<PlanCreateScrollInsetContextValue | null>(null);

const EXTRA_SCROLL_GAP_PX = 12;

export function PlanCreateScrollInsetProvider({
	children,
}: {
	children: ReactNode;
}) {
	const [measuredFooterHeight, setMeasuredFooterHeight] = useState<
		number | null
	>(null);

	const onFooterBlockLayout = useCallback((height: number) => {
		setMeasuredFooterHeight(height);
	}, []);

	const footerBlockHeight = measuredFooterHeight ?? FALLBACK_FOOTER_BLOCK_PX;

	/** Clear footer + fade band + small gap so last line sits above the vignette */
	const scrollPaddingBottom =
		footerBlockHeight +
		PLAN_CREATE_FOOTER_FADE_PX +
		EXTRA_SCROLL_GAP_PX;

	const value = useMemo<PlanCreateScrollInsetContextValue>(
		() => ({
			footerBlockHeight,
			scrollPaddingBottom,
			onFooterBlockLayout,
		}),
		[footerBlockHeight, scrollPaddingBottom, onFooterBlockLayout],
	);

	return (
		<PlanCreateScrollInsetContext.Provider value={value}>
			{children}
		</PlanCreateScrollInsetContext.Provider>
	);
}

/** Outside plan-create shell, inputs stay usable with conservative defaults */
export function usePlanCreateScrollInset(): PlanCreateScrollInsetContextValue {
	const ctx = useContext(PlanCreateScrollInsetContext);
	if (!ctx) {
		return {
			footerBlockHeight: FALLBACK_FOOTER_BLOCK_PX,
			scrollPaddingBottom:
				FALLBACK_FOOTER_BLOCK_PX +
				PLAN_CREATE_FOOTER_FADE_PX +
				EXTRA_SCROLL_GAP_PX,
			onFooterBlockLayout: () => {},
		};
	}
	return ctx;
}
