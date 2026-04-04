import { Box, Text } from "ink";

/** Matches Jobclaw / Claude Code terracotta accents. */
const TERRA = "#D97757";
/** Fedora hat — warm brown so it reads as felt, not skin. */
const HAT = "#5D4E37";
/** Near-black “pixel” eyes on the mascot. */
const EYE = "#111111";

function EyeRow() {
  return (
    <Text>
      <Text color={TERRA}>      ███</Text>
      <Text color={EYE}>█</Text>
      <Text color={TERRA}>██</Text>
      <Text color={EYE}>█</Text>
      <Text color={TERRA}>███</Text>
    </Text>
  );
}

/**
 * Blocky mascot + fedora-style hat (pixel look, reference layout).
 * Body uses █; eyes are darker blocks on two rows.
 */
export function InitMascot() {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={HAT}>   █████ </Text>
      <Text color={HAT}> █████████ </Text>
      <Text color={TERRA}>  ▐▛███▜▌ </Text>
      <Text color={TERRA}> ▝▜█████▛▘</Text>
      <Text color={TERRA}>   ▘▘ ▝▝  </Text>
    </Box>
  );
}
