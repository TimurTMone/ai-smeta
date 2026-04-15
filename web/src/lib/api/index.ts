/**
 * API facade — single entry point for all data access in the app.
 *
 * Components import from here and call typed functions. This file is the
 * swap point between the mock backend (localStorage + fixtures) and the
 * real FastAPI backend. Toggle via NEXT_PUBLIC_API_MODE env var.
 *
 *     NEXT_PUBLIC_API_MODE=mock   (default, demo mode)
 *     NEXT_PUBLIC_API_MODE=real   (once backend teammate has endpoints)
 *
 * Rule: no fetch() calls anywhere else in the codebase. All network I/O
 * funnels through here.
 */

import * as mockAuth from "./mock/auth";
import * as mockProjects from "./mock/projects";
import * as mockDecks from "./mock/decks";
import * as mockSmeta from "./mock/smeta";
import * as mockUsers from "./mock/users";
import * as mockRates from "./mock/rates";
import * as mockJobs from "./mock/jobs";

import * as realAuth from "./real/auth";
import * as realProjects from "./real/projects";
import * as realDecks from "./real/decks";
import * as realSmeta from "./real/smeta";
import * as realUsers from "./real/users";
import * as realRates from "./real/rates";
import * as realJobs from "./real/jobs";

const MODE =
  (process.env.NEXT_PUBLIC_API_MODE as "mock" | "real") ?? "mock";

const impl = MODE === "real"
  ? {
      ...realAuth,
      ...realProjects,
      ...realDecks,
      ...realSmeta,
      ...realUsers,
      ...realRates,
      ...realJobs,
    }
  : {
      ...mockAuth,
      ...mockProjects,
      ...mockDecks,
      ...mockSmeta,
      ...mockUsers,
      ...mockRates,
      ...mockJobs,
    };

// ---------- Auth ----------
export const getSession = impl.getSession;
export const requestMagicLink = impl.requestMagicLink;
export const verifyMagicLink = impl.verifyMagicLink;
export const logout = impl.logout;

// ---------- Projects ----------
export const listProjects = impl.listProjects;
export const getProject = impl.getProject;
export const createProject = impl.createProject;
export const updateProject = impl.updateProject;
export const deleteProject = impl.deleteProject;

// ---------- Decks ----------
export const getDeck = impl.getDeck;
export const updateDeck = impl.updateDeck;
export const ingestDeckFiles = impl.ingestDeckFiles;
export const renderDeck = impl.renderDeck;
export const exportDeckPdf = impl.exportDeckPdf;

// ---------- Smeta ----------
export const getSmeta = impl.getSmeta;
export const generateSmeta = impl.generateSmeta;
export const updateSmetaLine = impl.updateSmetaLine;
export const exportSmetaXlsx = impl.exportSmetaXlsx;

// ---------- Users / Admin ----------
export const listUsers = impl.listUsers;

// ---------- Rates ----------
export const listRates = impl.listRates;

// ---------- Jobs ----------
export const listJobs = impl.listJobs;
export const getJob = impl.getJob;

export const API_MODE = MODE;
