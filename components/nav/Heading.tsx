import { OutlineButton } from "../buttons/OutlineButton";
import { MyLinks } from "./components/MyLinks";
import styles from "./heading.module.scss";

export const Heading = () => {
  return (
    <header className={styles.heading}>
      <MyLinks />
      <OutlineButton
        onClick={() => window.open("/OsmanSultanResumeSWEFocus.pdf")}
      >
        My resume
      </OutlineButton>
    </header>
  );
};
