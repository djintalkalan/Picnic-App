import React, { useEffect, useState } from 'react';

import FeatureFlagService from './FeatureFlagService';

interface FeatureFlagWrapperProps {
    children: React.ReactNode
    flag: string
    condition?: boolean
}

// function for rendering components depending on set feature flags 
function FeatureFlagWrapper({ children, flag, condition = true }: FeatureFlagWrapperProps) {
    const [flagValue, setFlagValue] = useState<boolean>(false);

    useEffect(() => {
        async function getFlagValue() {
            let isOn: boolean = await FeatureFlagService.checkFlag(flag);
            setFlagValue(isOn);
        }
        getFlagValue()
    }, [])
    // check if the passed-in flag is on
    if (flagValue == condition) {
        return <>{children}</>
    } else {
        return <></>
    }
}

export default FeatureFlagWrapper