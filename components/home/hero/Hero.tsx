import { StandardButton } from "@components/buttons/StandardButton";
import { Reveal } from "@components/utils/Reveal";
import { DotGrid } from "./DotGrid";
import styles from "./hero.module.scss";

export const Hero = () => {
  return (
    <section className={`section-wrapper ${styles.hero}`}>
      <div className={styles.copyWrapper}>
        <Reveal>
          <h1 className={styles.title}>
            👋Hi, i&apos;m Osman<span>.</span>
          </h1>
        </Reveal>
        <Reveal>
          <h2 className={styles.subTitle}>
            Welcome to my <span>node of the internet!</span>
          </h2>
        </Reveal>
        <Reveal>
          <div className={styles.aboutCopy}>
            <p>
              I&apos;m an engineering student based in the Greater Toronto
              Area🛣️. My interests lie in Full Stack Engineering, System
              Infrastructure, and MLOps. You&apos;ll likely find me watching the
              latest{" "}
              <a target="_blank" href="https://www.youtube.com/c/Fireship">
                fireship.io
              </a>{" "}
              code report,{" "}
              <a
                target="_blank"
                href="https://www.youtube.com/user/marquesbrownlee"
              >
                MKBHD
              </a>{" "}
              review, or prompting the latest LLM. Beyond tech, I love cars &
              motorsport (Forza Ferrari! 🏎️), football (Visca Barca! 🔴🔵), and
              building PCs.
            </p>
            <br />
            <p>Let&apos;s connect!</p>
          </div>
        </Reveal>
        <Reveal>
          <StandardButton
            onClick={() => document.getElementById("contact")?.scrollIntoView()}
          >
            Contact me
          </StandardButton>
        </Reveal>
      </div>
      <DotGrid />
    </section>
  );
};
