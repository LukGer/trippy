import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useMultiStepFlow } from "@/src/components/multi-step-flow";

type MultiStepPrimaryGateContextValue = {
	/** When true, the flow footer primary button stays disabled (Continue / etc.). */
	continueDisabled: boolean;
	setContinueDisabled: (disabled: boolean) => void;
};

const MultiStepPrimaryGateContext =
	createContext<MultiStepPrimaryGateContextValue | null>(null);

/** Wrap plan-create chrome so steps can toggle whether “Continue” is allowed. */
export function MultiStepPrimaryGateProvider({
	children,
}: {
	children: ReactNode;
}) {
	const { activeIndex } = useMultiStepFlow();
	const [continueDisabled, setContinueDisabledState] = useState(false);

	useEffect(() => {
		setContinueDisabledState(false);
	}, [activeIndex]);

	const setContinueDisabled = useCallback((disabled: boolean) => {
		setContinueDisabledState((prev) => (prev === disabled ? prev : disabled));
	}, []);

	const value = useMemo<MultiStepPrimaryGateContextValue>(
		() => ({ continueDisabled, setContinueDisabled }),
		[continueDisabled, setContinueDisabled],
	);

	return (
		<MultiStepPrimaryGateContext.Provider value={value}>
			{children}
		</MultiStepPrimaryGateContext.Provider>
	);
}

export function useMultiStepPrimaryGate(): MultiStepPrimaryGateContextValue {
	const ctx = useContext(MultiStepPrimaryGateContext);
	if (!ctx) {
		throw new Error(
			"useMultiStepPrimaryGate must be used within MultiStepPrimaryGateProvider",
		);
	}
	return ctx;
}
