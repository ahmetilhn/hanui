'use client';

import { createContext, useContext } from 'react';

import type { UiContextValue } from '@/types/theme.type';

const UiContext = createContext<UiContextValue>({});

/** Sağlayıcı ZORUNLU DEĞİL. */
export const useUi = (): UiContextValue => useContext(UiContext);

export default UiContext;
