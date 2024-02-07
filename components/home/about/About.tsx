import { MyLinks } from "@/components/nav/components/MyLinks";
import { Reveal } from "@/components/utils/Reveal";
import { SectionHeader } from "@/components/utils/SectionHeader";
import { AiOutlineArrowRight } from "react-icons/ai";
import { Stats } from "./Stats";
import styles from "./about.module.scss";

export const About = () => {
  return (
    <section id="about" className="section-wrapper">
      <SectionHeader title="about" dir="l" />
      <div className={styles.about}>
        <div>
          <Reveal>
            <p className={`${styles.aboutText} ${styles.highlightFirstLetter}`}>
              Hi✌️, I&apos;m Osman. My goal lies in making interactions between
              humans and tech as accessible as possible. Based in the Greater
              Toronto Area, my path is consistently fueled by curiosity,
              absorbing all that I can from the many remarkable people around
              me🚘.
            </p>
          </Reveal>
          <Reveal>
            <p className={styles.aboutText}>
              As a victim of FOMO, I&apos;m a serial hobby hopper. Currently, my
              interests lie in walkable cities (Mississauga native🛣️ lol), cars
              (8+ cylinders, rotary, or bust), and the thought that Messi might
              play at BMO field⚽.
            </p>
          </Reveal>
          <Reveal>
            <div>
              <p className={styles.aboutText} style={{ fontWeight: "bold" }}>
                Now:
              </p>
              <p className={styles.aboutText}>
                I&apos;m a 4th year Industrial & Systems Engineering major
                pursuing a double minor in AI + Business at the University of
                Toronto.
              </p>

              <p className={styles.aboutText}>
                Building out the web platform at {""}
                <a href="https://doctalk.com" target="_blank">
                  Doctalk Inc.
                </a>
                {""} as a full stack engineering intern.
              </p>
              <p className={styles.aboutText}>
                Working at a startup truly means wearing multiple hats, and my
                experience has been a testament to that. Initially hired for web
                development, my role quickly expanded to encompass
                infrastructure, DevOps, and backend architecture – and
                I`&apos;ve thoroughly enjoyed the ride :).
              </p>

              <p className={styles.aboutText} style={{ fontWeight: "bold" }}>
                Previously:
              </p>
              <p className={styles.aboutText}>
                Wrote some Python backend code as a SWE intern at{" "}
                <a href="https://www.molex.com/en-us/home" target="_blank">
                  Molex
                </a>
                .
              </p>
              <p className={styles.aboutText}>
                Lead a team of 4 in building websites for uoft-affiliated
                clubs/students at{" "}
                <a href="https://utfo.ca" target="_blank">
                  UTFO
                </a>
                .
              </p>
              <p className={styles.aboutText}>
                Taught some Python, Java, and SQL I learned in highschool to
                novice 2nd year engineering students.
              </p>
              <p className={styles.aboutText}>
                Lead f!rosh week thrice, welcoming incoming 1st years in the
                awesomest way possible.
              </p>
              <p className={styles.aboutText}>
                Made STEM accesible to youth in low-income communities with{" "}
                <a href="https://www.vosnl.org/" target="_blank">
                  visions of science
                </a>
                .
              </p>
            </div>
          </Reveal>
          <Reveal>
            <div className={styles.links}>
              <div className={styles.linksText}>
                <span>continue the conversation:</span>
                <AiOutlineArrowRight />
              </div>
              <MyLinks />
            </div>
          </Reveal>
        </div>
        <Stats />
      </div>
    </section>
  );
};
