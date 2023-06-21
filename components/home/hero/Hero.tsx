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
            👋hi, i&apos;m Osman<span>.</span>
          </h1>
        </Reveal>
        <Reveal>
          <h2 className={styles.subTitle}>
            welcome to my <span>node of the internet!</span>
          </h2>
        </Reveal>
        <Reveal>
          <div className={styles.aboutCopy}>
            <p>
              i&apos;m an engineering student based in the greater toronto
              area🛣️. fanatical about ethical machine learning for societal good
              and web dev for accessibility, you&apos;ll likely find me watching
              the latest{" "}
              <a target="_blank" href="https://www.youtube.com/c/Fireship">
                fireship.io
              </a>{" "}
              code report,{" "}
              <a
                target="_blank"
                href="https://www.youtube.com/user/marquesbrownlee"
              >
                mkbhd
              </a>{" "}
              review, or prompting the latest llm. beyond tech, i love cars &
              motorsport (forza ferrari! 🏎️), football (visca barca! 🔴🔵), and
              building pcs.
            </p>
            <br />
            <p>let&apos;s connect!</p>
          </div>
        </Reveal>
        <Reveal>
          <StandardButton
            onClick={() => document.getElementById("contact")?.scrollIntoView()}
          >
            contact me
          </StandardButton>
        </Reveal>
      </div>
      <DotGrid />
    </section>
  );
};
