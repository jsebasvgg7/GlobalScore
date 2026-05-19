import React from 'react';
import PackOpeningModal from './PackOpeningModal';
import PackOpeningModalMobile from '../components/mobile/PackOpeningModalMobile';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function PackOpeningModalWrapper(props) {
    const isMobile = useMediaQuery('(max-width: 768px)');

    if (isMobile) {
        return <PackOpeningModalMobile {...props} />;
    }

    return <PackOpeningModal {...props} />;
}
