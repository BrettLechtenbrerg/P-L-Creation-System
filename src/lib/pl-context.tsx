"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { PLModel, ScenarioType } from "./pl-types";
import { createTSAIDemoModel } from "./pl-defaults";
import { v4 as uuid } from "uuid";

interface PLContextType {
  model: PLModel;
  setModel: (model: PLModel) => void;
  // Convenience updaters
  updateCompanyName: (name: string) => void;
  updateStartDate: (date: string) => void;
  updateChurnRate: (rate: number) => void;
  addRevenueStream: (stream: { name: string; type: "one-time" | "recurring"; price: number; unit: string }) => void;
  removeRevenueStream: (id: string) => void;
  updateRevenueStream: (id: string, updates: Partial<{ name: string; price: number; unit: string }>) => void;
  addExpenseItem: (categoryId: string, item: { name: string; monthlyCost: number }) => void;
  removeExpenseItem: (categoryId: string, itemId: string) => void;
  updateExpenseItem: (categoryId: string, itemId: string, updates: Partial<{ name: string; monthlyCost: number }>) => void;
  addExpenseCategory: (name: string) => void;
  removeExpenseCategory: (categoryId: string) => void;
  updateStartingValue: (streamId: string, count: number) => void;
  updateClientAcquisition: (scenario: ScenarioType, streamId: string, monthIndex: number, value: number) => void;
  loadDemoData: () => void;
  isDirty: boolean;
}

const PLContext = createContext<PLContextType | null>(null);

const STORAGE_KEY = "pl-creation-system-model";

export function PLProvider({ children }: { children: React.ReactNode }) {
  const [model, setModelState] = useState<PLModel>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved) as PLModel;
        } catch {
          // Fall through to demo
        }
      }
    }
    return createTSAIDemoModel();
  });
  const [isDirty, setIsDirty] = useState(false);

  // Auto-save to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(model));
  }, [model]);

  const setModel = useCallback((newModel: PLModel) => {
    setModelState(newModel);
    setIsDirty(true);
  }, []);

  const updateCompanyName = useCallback((name: string) => {
    setModelState((prev) => ({ ...prev, companyName: name }));
    setIsDirty(true);
  }, []);

  const updateStartDate = useCallback((date: string) => {
    setModelState((prev) => ({ ...prev, startDate: date }));
    setIsDirty(true);
  }, []);

  const updateChurnRate = useCallback((rate: number) => {
    setModelState((prev) => ({ ...prev, monthlyChurnRate: rate }));
    setIsDirty(true);
  }, []);

  const addRevenueStream = useCallback(
    (stream: { name: string; type: "one-time" | "recurring"; price: number; unit: string }) => {
      const newStream = { id: uuid(), ...stream };
      setModelState((prev) => {
        const updated = {
          ...prev,
          revenueStreams: [...prev.revenueStreams, newStream],
        };
        // Initialize client acquisition for all scenarios
        if (stream.type === "recurring") {
          updated.startingValues = [...prev.startingValues, { streamId: newStream.id, count: 0 }];
        }
        for (const scenarioType of ["conservative", "moderate", "aggressive"] as ScenarioType[]) {
          updated.scenarios = {
            ...updated.scenarios,
            [scenarioType]: {
              clientAcquisition: {
                ...updated.scenarios[scenarioType].clientAcquisition,
                [newStream.id]: new Array(36).fill(0),
              },
            },
          };
        }
        return updated;
      });
      setIsDirty(true);
    },
    []
  );

  const removeRevenueStream = useCallback((id: string) => {
    setModelState((prev) => {
      const updated = {
        ...prev,
        revenueStreams: prev.revenueStreams.filter((s) => s.id !== id),
        startingValues: prev.startingValues.filter((sv) => sv.streamId !== id),
      };
      for (const scenarioType of ["conservative", "moderate", "aggressive"] as ScenarioType[]) {
        const acq = { ...updated.scenarios[scenarioType].clientAcquisition };
        delete acq[id];
        updated.scenarios = {
          ...updated.scenarios,
          [scenarioType]: { clientAcquisition: acq },
        };
      }
      return updated;
    });
    setIsDirty(true);
  }, []);

  const updateRevenueStream = useCallback(
    (id: string, updates: Partial<{ name: string; price: number; unit: string }>) => {
      setModelState((prev) => ({
        ...prev,
        revenueStreams: prev.revenueStreams.map((s) => (s.id === id ? { ...s, ...updates } : s)),
      }));
      setIsDirty(true);
    },
    []
  );

  const addExpenseItem = useCallback((categoryId: string, item: { name: string; monthlyCost: number }) => {
    setModelState((prev) => ({
      ...prev,
      expenseCategories: prev.expenseCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, items: [...cat.items, { id: uuid(), ...item }] } : cat
      ),
    }));
    setIsDirty(true);
  }, []);

  const removeExpenseItem = useCallback((categoryId: string, itemId: string) => {
    setModelState((prev) => ({
      ...prev,
      expenseCategories: prev.expenseCategories.map((cat) =>
        cat.id === categoryId ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) } : cat
      ),
    }));
    setIsDirty(true);
  }, []);

  const updateExpenseItem = useCallback(
    (categoryId: string, itemId: string, updates: Partial<{ name: string; monthlyCost: number }>) => {
      setModelState((prev) => ({
        ...prev,
        expenseCategories: prev.expenseCategories.map((cat) =>
          cat.id === categoryId
            ? { ...cat, items: cat.items.map((i) => (i.id === itemId ? { ...i, ...updates } : i)) }
            : cat
        ),
      }));
      setIsDirty(true);
    },
    []
  );

  const addExpenseCategory = useCallback((name: string) => {
    setModelState((prev) => ({
      ...prev,
      expenseCategories: [...prev.expenseCategories, { id: uuid(), name, items: [] }],
    }));
    setIsDirty(true);
  }, []);

  const removeExpenseCategory = useCallback((categoryId: string) => {
    setModelState((prev) => ({
      ...prev,
      expenseCategories: prev.expenseCategories.filter((c) => c.id !== categoryId),
    }));
    setIsDirty(true);
  }, []);

  const updateStartingValue = useCallback((streamId: string, count: number) => {
    setModelState((prev) => ({
      ...prev,
      startingValues: prev.startingValues.map((sv) =>
        sv.streamId === streamId ? { ...sv, count } : sv
      ),
    }));
    setIsDirty(true);
  }, []);

  const updateClientAcquisition = useCallback(
    (scenario: ScenarioType, streamId: string, monthIndex: number, value: number) => {
      setModelState((prev) => {
        const currentAcq = prev.scenarios[scenario].clientAcquisition[streamId] || new Array(36).fill(0);
        const newAcq = [...currentAcq];
        newAcq[monthIndex] = value;
        return {
          ...prev,
          scenarios: {
            ...prev.scenarios,
            [scenario]: {
              clientAcquisition: {
                ...prev.scenarios[scenario].clientAcquisition,
                [streamId]: newAcq,
              },
            },
          },
        };
      });
      setIsDirty(true);
    },
    []
  );

  const loadDemoData = useCallback(() => {
    setModelState(createTSAIDemoModel());
    setIsDirty(true);
  }, []);

  return (
    <PLContext.Provider
      value={{
        model,
        setModel,
        updateCompanyName,
        updateStartDate,
        updateChurnRate,
        addRevenueStream,
        removeRevenueStream,
        updateRevenueStream,
        addExpenseItem,
        removeExpenseItem,
        updateExpenseItem,
        addExpenseCategory,
        removeExpenseCategory,
        updateStartingValue,
        updateClientAcquisition,
        loadDemoData,
        isDirty,
      }}
    >
      {children}
    </PLContext.Provider>
  );
}

export function usePL() {
  const ctx = useContext(PLContext);
  if (!ctx) throw new Error("usePL must be used within PLProvider");
  return ctx;
}
