import {
	Children,
	createContext,
	isValidElement,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export type MultiStepFlowStepProps = {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	/** Primary footer action label for this step (e.g. Continue, Create plan) */
	primaryButtonLabel?: string;
	children?: ReactNode;
};

type ParsedStep = {
	eyebrow?: string;
	title?: string;
	subtitle?: string;
	primaryButtonLabel?: string;
	body: ReactNode;
};

export type MultiStepFlowContextValue = {
	activeIndex: number;
	totalSteps: number;
	canGoBack: boolean;
	/** True when there is another step after the current one */
	hasNextStep: boolean;
	isLastStep: boolean;
	currentStep: ParsedStep | undefined;
	/** All registered steps (for animated outlet) */
	steps: ParsedStep[];
	goNext: () => void;
	goBack: () => void;
	goTo: (index: number) => void;
};

const MultiStepFlowContext = createContext<MultiStepFlowContextValue | null>(
	null,
);

function MultiStepFlowStep(_props: MultiStepFlowStepProps) {
	return null;
}

function collectSteps(children: ReactNode): ParsedStep[] {
	const steps: ParsedStep[] = [];
	Children.forEach(children, (child) => {
		if (!isValidElement<MultiStepFlowStepProps>(child)) return;
		if (child.type !== MultiStepFlowStep) return;
		steps.push({
			eyebrow: child.props.eyebrow,
			title: child.props.title,
			subtitle: child.props.subtitle,
			primaryButtonLabel: child.props.primaryButtonLabel,
			body: child.props.children,
		});
	});
	return steps;
}

function collectChrome(children: ReactNode): ReactNode[] {
	const chrome: ReactNode[] = [];
	Children.forEach(children, (child) => {
		if (isValidElement(child) && child.type === MultiStepFlowStep) return;
		chrome.push(child);
	});
	return chrome;
}

type MultiStepFlowRootProps = {
	children: ReactNode;
	initialStep?: number;
	onComplete?: () => void;
};

function MultiStepFlowRoot({
	children,
	initialStep = 0,
	onComplete,
}: MultiStepFlowRootProps) {
	const steps = useMemo(() => collectSteps(children), [children]);
	const chrome = useMemo(() => collectChrome(children), [children]);
	const [activeIndex, setActiveIndex] = useState(() =>
		Math.min(initialStep, Math.max(0, steps.length - 1)),
	);

	const totalSteps = steps.length;
	const lastIndex = Math.max(0, totalSteps - 1);
	const clampedIndex = Math.min(Math.max(0, activeIndex), lastIndex);

	const goNext = useCallback(() => {
		setActiveIndex((i) => {
			const next = i + 1;
			if (next >= totalSteps) {
				onComplete?.();
				return i;
			}
			return next;
		});
	}, [onComplete, totalSteps]);

	const goBack = useCallback(() => {
		setActiveIndex((i) => Math.max(0, i - 1));
	}, []);

	const goTo = useCallback(
		(index: number) => {
			setActiveIndex(() => Math.min(Math.max(0, index), lastIndex));
		},
		[lastIndex],
	);

	const value = useMemo<MultiStepFlowContextValue>(
		() => ({
			activeIndex: clampedIndex,
			totalSteps,
			canGoBack: clampedIndex > 0,
			hasNextStep: clampedIndex < lastIndex,
			isLastStep: clampedIndex >= lastIndex && totalSteps > 0,
			currentStep: steps[clampedIndex],
			steps,
			goNext,
			goBack,
			goTo,
		}),
		[clampedIndex, totalSteps, lastIndex, steps, goNext, goBack, goTo],
	);

	return (
		<MultiStepFlowContext.Provider value={value}>
			{chrome}
		</MultiStepFlowContext.Provider>
	);
}

const STEP_OUT_MS = 170;
const STEP_IN_MS = 220;
const STEP_SLIDE_DP = 14;

function MultiStepFlowOutlet() {
	const { activeIndex, steps } = useMultiStepFlow();
	const [renderIndex, setRenderIndex] = useState(activeIndex);
	const opacity = useSharedValue(1);
	const translateX = useSharedValue(0);
	const pendingDir = useRef<1 | -1>(1);
	const skipInitialEnter = useRef(true);

	useEffect(() => {
		setRenderIndex((r) =>
			r >= steps.length ? Math.max(0, steps.length - 1) : r,
		);
	}, [steps.length]);

	useEffect(() => {
		if (activeIndex === renderIndex) return;

		pendingDir.current = activeIndex > renderIndex ? 1 : -1;
		const dir = pendingDir.current;
		/** Primitive snapshot — never pass a ref into worklets / scheduleOnRN callbacks */
		const targetIndex = activeIndex;

		translateX.value = 0;
		opacity.value = withTiming(0, { duration: STEP_OUT_MS }, (finished) => {
			if (finished) scheduleOnRN(setRenderIndex, targetIndex);
		});
		translateX.value = withTiming(-dir * STEP_SLIDE_DP, {
			duration: STEP_OUT_MS,
		});
	}, [activeIndex, renderIndex, opacity, translateX]);

	useEffect(() => {
		if (skipInitialEnter.current) {
			skipInitialEnter.current = false;
			return;
		}

		const dir = pendingDir.current;
		translateX.value = dir * STEP_SLIDE_DP;
		opacity.value = 0;
		opacity.value = withTiming(1, { duration: STEP_IN_MS });
		translateX.value = withTiming(0, { duration: STEP_IN_MS });
	}, [renderIndex, opacity, translateX]);

	const animatedStyle = useAnimatedStyle(() => ({
		flex: 1,
		minHeight: 0,
		opacity: opacity.value,
		transform: [{ translateX: translateX.value }],
	}));

	const body = steps[renderIndex]?.body;

	return <Animated.View style={animatedStyle}>{body}</Animated.View>;
}

export const MultiStepFlow = Object.assign(MultiStepFlowRoot, {
	Step: MultiStepFlowStep,
	Outlet: MultiStepFlowOutlet,
});

export function useMultiStepFlow(): MultiStepFlowContextValue {
	const ctx = useContext(MultiStepFlowContext);
	if (!ctx) {
		throw new Error("useMultiStepFlow must be used within MultiStepFlow");
	}
	return ctx;
}
