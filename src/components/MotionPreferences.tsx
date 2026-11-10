"use client";
import React from "react";
import { MotionConfig } from "framer-motion";

// Lets server-rendered pages honour the visitor's "reduce motion" setting for
// every animation inside them.
const MotionPreferences = ({ children }: { children: React.ReactNode }) => <MotionConfig reducedMotion="user">{children}</MotionConfig>;

export default MotionPreferences;
