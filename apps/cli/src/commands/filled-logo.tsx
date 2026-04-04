import { Box, Static, Text } from "ink";
import Gradient from "ink-gradient";
import BigText from "ink-big-text";
import { InitMascot } from "./init-mascot.js";

/** Terracotta stops — same family as Claude Code welcome UI. */
const TERRACOTTA = ["#E06C4D", "#D97757", "#C65D3E"] as const;

export type JobclawFilledLogoProps = {
  /** When true (e.g. `jobclaw init`), mascot is pinned in `<Static>` with the logo so Ink’s live region does not erase it. */
  showInitMascot?: boolean;
};

/**
 * Block / “filled” logo (gradient painted across BigText), matching oh-my-logo `--filled`
 * (see [oh-my-logo InkRenderer](https://github.com/shinshin86/oh-my-logo)).
 * `<Static>` keeps it in the preserved region above live Ink updates during init.
 */
export function JobclawFilledLogoStatic({
  showInitMascot = false,
}: JobclawFilledLogoProps) {
  return (
    <Static items={[1]}>
      {() => (
        <Box key="jobclaw-filled-logo" flexDirection="column" marginBottom={1}>
          <Gradient colors={[...TERRACOTTA]}>
            <BigText text="JOBCLAW" font="block" letterSpacing={1} />
          </Gradient>
          {showInitMascot ? (
            <>
              <Text> </Text>
              <InitMascot />
            </>
          ) : null}
        </Box>
      )}
    </Static>
  );
}
