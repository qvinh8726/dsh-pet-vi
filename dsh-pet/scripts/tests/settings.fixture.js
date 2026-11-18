import { useState, useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { jsx } from 'react/jsx-runtime';
import { makePetConfigSection, petBridge, dicts } from '../../src/client/settings.ts';
import { DEFAULT_FONT, fontStackOf } from '../../src/shared/fonts.ts';

petBridge.current = window.initialConfig.main.pets;
petBridge.template = petBridge.current[0];
document.documentElement.style.setProperty('--fixture-pet-font', fontStackOf(DEFAULT_FONT.family));
const language = new URLSearchParams(location.search).get('lang') || navigator.language;
const dictionary = dicts[language] ?? dicts[language.split('-')[0]] ?? dicts.en;
const Section = makePetConfigSection(
  {
    h: jsx,
    useState,
    useEffect,
    useRef,
    useCallback,
    t: (key) => dictionary[key] ?? key,
  },
  { get: () => undefined },
);
createRoot(document.getElementById('root')).render(jsx(Section, {}));
