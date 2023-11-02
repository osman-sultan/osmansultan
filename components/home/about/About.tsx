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
              Hello world✌️, I&apos;m Osman. I&apos;m a bit all over the place
              but my goal lies in making interactions between humans and tech as
              accessible as possible. Based in the Greater Toronto Area,
              I&apos;m on a constant journey fueled by curiosity, absorbing all
              that I can from the many remarkable people around me🚘.
            </p>
          </Reveal>
          <Reveal>
            <p className={styles.aboutText}>
              As an unfortunate victim of FOMO, I&apos;m a serial hobby hopper.
              Currently, my interests lie in walkable cities (I&apos;m a
              Mississauga native🛣️ lol), cars (preferably with 8+ cylinders or a
              rotary), The Crew Motofest, and the thought that Messi might play
              at BMO field⚽.
            </p>
          </Reveal>
          <Reveal>
            <div>
              <p className={styles.aboutText} style={{ fontWeight: "bold" }}>
                Now:
              </p>
              <p className={styles.aboutText}>
                I&apos;m a 4th year Industrial & Systems Engineering major with
                a double minor in AI + Business at the University of Toronto.
              </p>
              <p className={styles.aboutText}>
                On a gap-year to pursue internships and personal projects.
              </p>
              <p className={styles.aboutText}>
                Building out the web platform at {""}
                <a href="https://doctalk.com" target="_blank">
                  Doctalk Inc.
                </a>
                {""} as a full stack engineering intern.
              </p>
              <p className={styles.aboutText}>
                People don&apos;t lie when they say you wear multiple hats at a
                start up. What was initially a web dev role quickly turned into
                a infrastructure, devops, and backend architect role, and I love
                it. My manager put full faith that us interns can take on a
                whole database migration - and we did :).
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
                Lead f!rosh week thrice (and hopefully a fourth time next
                september), welcoming incoming 1st years in the awesomest way
                possible.
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
