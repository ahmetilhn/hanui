'use client';

import { createContext, useContext } from 'react';

import type { HanuiContextValue } from '@/types/theme.type';

const HanuiContext = createContext<HanuiContextValue>({});

/** Sağlayıcı ZORUNLU DEĞİL. */
export const useHanui = (): HanuiContextValue => useContext(HanuiContext);

export default HanuiContext;
