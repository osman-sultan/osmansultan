"use client";

import React from "react";
import { Heading } from "../nav/Heading";
import { SideBar } from "../nav/SideBar";
import { About } from "./about/About";
import { Contact } from "./contact/Contact";
import { Experience } from "./experience/Experience";
import { Hero } from "./hero/Hero";
import styles from "./home.module.scss";
import { Projects } from "./projects/Projects";

export default function Home() {
  return (
    <>
      <div className={styles.home}>
        <SideBar />
        <main>
          <Heading />
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Contact />
          <div
            style={{
              height: "200px",
              background:
                "linear-gradient(180deg, var(--background), var(--background-dark))",
            }}
          />
        </main>
      </div>
    </>
  );
}
