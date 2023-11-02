import { Reveal } from "@/components/utils/Reveal";
import Link from "next/link";
import { AiFillMail } from "react-icons/ai";
import styles from "./contact.module.scss";

export const Contact = () => {
  return (
    <section className="section-wrapper" id="contact">
      <div className={styles.contactWrapper}>
        <Reveal width="100%">
          <h4 className={styles.contactTitle}>
            contact<span>.</span>
          </h4>
        </Reveal>
        <Reveal width="100%">
          <p className={styles.contactCopy}>
            Shoot me an email if you want to connect! You can also find me on{" "}
            <Link
              href="https://www.linkedin.com/in/osmansultan-/"
              target="_blank"
              rel="nofollow"
            >
              LinkedIn
            </Link>{" "}
            if that&apos;s more your speed.
          </p>
        </Reveal>
        <Reveal width="100%">
          <Link href="mailto:osman.sultan@mail.utoronto.ca">
            <div className={styles.contactEmail}>
              <AiFillMail size="2.4rem" />
              <span>osman.sultan@mail.utoronto.ca</span>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
};
