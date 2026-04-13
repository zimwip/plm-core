#!/usr/bin/env bash
# ============================================================
# demo.sh — Aircraft Product Structure Demo
#
# Creates a realistic A320-Neo product breakdown structure
# in PLM Core: 75 nodes (Parts) linked in a 7-level tree.
#
# Usage:
#   ./demo.sh              # targets http://localhost:3000
#   ./demo.sh --local      # targets native dev servers (port 5173 frontend, 8080 psm)
#   ./demo.sh <BASE_URL>   # targets an arbitrary URL
#
# Requirements: curl, sed (both standard on Linux/macOS)
# ============================================================

set -euo pipefail

# ── Config ───────────────────────────────────────────────────

if [[ "${1:-}" == "--local" ]]; then
  BASE="http://localhost:8080"
  PSM="/api/psm"
else
  BASE="${1:-http://localhost:3000}"
  PSM="/api/psm"
fi

USER="user-alice"
PS="ps-default"
NT="nt-part"
LT="lt-composed-of"
# node_type_action id for CREATE_LINK on Part — from V2__seed_data.sql
NTA_CREATE_LINK="nta-cl-prt"

# ── Helpers ──────────────────────────────────────────────────

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
RED='\033[0;31m'; BOLD='\033[1m'; NC='\033[0m'

log()  { printf "${CYAN}▶  %s${NC}\n" "$*"; }
ok()   { printf "${GREEN}✓  %s${NC}\n" "$*"; }
warn() { printf "${YELLOW}⚠  %s${NC}\n" "$*"; }
fail() { printf "${RED}✗  %s${NC}\n" "$*" >&2; exit 1; }

# Extract a JSON string value by key from a one-line JSON object.
# Usage: json_str KEY <<< '{"key":"value"}'
json_str() {
  sed -n "s/.*\"${1}\":\"\([^\"]*\)\".*/\1/p"
}

LINK_COUNT=0
# Temp file used to count nodes across subshells ($(…) forks a subshell,
# so variable increments inside create_node would be lost otherwise).
_NODE_CTR=$(mktemp)
echo 0 > "$_NODE_CTR"
trap 'rm -f "$_NODE_CTR"' EXIT

# Create a Part node.
# Args: logical_id  name  [material]  [weight_kg]  [drawing_ref]
# Prints the nodeId to stdout (captured by callers with $(...)).
# All progress/display goes to stderr so it does NOT pollute the captured value.
create_node() {
  local lid="$1" name="$2" material="${3:-}" weight="${4:-}" drawing="${5:-}"

  # Keys must be attribute_definition.id values (not the 'name' column)
  local attrs="{\"ad-part-name\":$(jq_str "$name")"
  [[ -n "$material" ]] && attrs+=",\"ad-part-material\":$(jq_str "$material")"
  [[ -n "$weight"   ]] && attrs+=",\"ad-part-weight\":$(jq_str "$weight")"
  [[ -n "$drawing"  ]] && attrs+=",\"ad-part-drawing\":$(jq_str "$drawing")"
  attrs+="}"

  local body="{\"nodeTypeId\":\"$NT\",\"userId\":\"$USER\",\"attributes\":$attrs,\"logicalId\":\"$lid\"}"

  local resp
  resp=$(curl -sf -X POST "${BASE}${PSM}/nodes" \
    -H "Content-Type: application/json" \
    -H "X-PLM-User: $USER" \
    -H "X-PLM-ProjectSpace: $PS" \
    -d "$body") || { printf "${RED}✗  Failed to create node %s${NC}\n" "$lid" >&2; exit 1; }

  local nid
  nid=$(echo "$resp" | json_str "nodeId")
  if [[ -z "$nid" ]]; then
    printf "${RED}✗  Empty nodeId for %s (response: %s)${NC}\n" "$lid" "$resp" >&2
    exit 1
  fi

  # Increment counter via temp file (survives subshell boundary)
  local cnt
  cnt=$(( $(cat "$_NODE_CTR") + 1 ))
  echo "$cnt" > "$_NODE_CTR"
  printf "    %3d  %-12s  %s\n" "$cnt" "$lid" "$name" >&2

  # Only the node ID goes to stdout — this is what $(...) captures
  echo "$nid"
}

# Minimal JSON string escaper (handles the characters we'll actually encounter).
jq_str() {
  local v="$1"
  v="${v//\\/\\\\}"
  v="${v//\"/\\\"}"
  printf '"%s"' "$v"
}

# Create a composed_of link from source to target.
# Args: source_node_id  target_node_id  link_logical_id  tx_id
create_link() {
  local src="$1" tgt="$2" lid="$3" tx="$4"

  local body
  body="{\"userId\":\"$USER\",\"parameters\":{"
  body+="\"linkTypeId\":\"$LT\","
  body+="\"targetNodeId\":\"$tgt\","
  body+="\"linkLogicalId\":\"$lid\""
  body+="}}"

  curl -sf -X POST "${BASE}${PSM}/nodes/${src}/actions/${NTA_CREATE_LINK}" \
    -H "Content-Type: application/json" \
    -H "X-PLM-User: $USER" \
    -H "X-PLM-ProjectSpace: $PS" \
    -H "X-PLM-Tx: $tx" \
    -d "$body" > /dev/null \
    || fail "Failed to create link $lid ($src → $tgt)"

  LINK_COUNT=$(( LINK_COUNT + 1 ))
}

# ── Pre-flight check ─────────────────────────────────────────

printf "\n"
printf "${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}\n"
printf "${BOLD}║       PLM Core — Aircraft A320-Neo Demo Data              ║${NC}\n"
printf "${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}\n\n"

log "Target: ${BASE}${PSM}"
log "Checking backend health…"
curl -sf "${BASE}/actuator/health" > /dev/null \
  || fail "Backend not reachable at ${BASE}/actuator/health — is the stack running?"
ok "Backend is up"
printf "\n"

# ═════════════════════════════════════════════════════════════
# PHASE 1 — CREATE NODES
# ═════════════════════════════════════════════════════════════

log "Creating nodes…"
printf "    %3s  %-12s  %s\n" "#" "Part No." "Name"
printf "    %s\n" "---  ------------  -----------------------------------------------"

# ── Top level ────────────────────────────────────────────────
AIRCRAFT=$(create_node  "P-000001" "Aircraft A320-Neo"              "Composite" "78000"  "DWG-A000")

# ── Airframe ─────────────────────────────────────────────────
AIRFRAME=$(create_node  "P-000002" "Airframe Assembly"              "Composite" "25000"  "DWG-A100")
FUSELAGE=$(create_node  "P-000003" "Fuselage Assembly"              "Aluminum"  "8500"   "DWG-A110")
FWD_FUS=$( create_node  "P-000004" "Forward Fuselage Section"       "Aluminum"  "1200"   "DWG-A111")
CTR_FUS=$( create_node  "P-000005" "Center Fuselage Section"        "Aluminum"  "3800"   "DWG-A112")
AFT_FUS=$( create_node  "P-000006" "Aft Fuselage Section"           "Aluminum"  "2100"   "DWG-A113")
WING_ASSY=$(create_node "P-000007" "Wing Assembly"                  "Composite" "9500"   "DWG-A120")
LEFT_WING=$(create_node "P-000008" "Left Wing"                      "Composite" "4200"   "DWG-A121")
L_AILERON=$(create_node "P-000009" "Left Aileron"                   "Composite" "180"    "DWG-A122")
L_FLAP=$(   create_node "P-000010" "Left Flap"                      "Composite" "320"    "DWG-A123")
L_SLAT=$(   create_node "P-000011" "Left Slat"                      "Composite" "145"    "DWG-A124")
RGHT_WING=$(create_node "P-000012" "Right Wing"                     "Composite" "4200"   "DWG-A125")
R_AILERON=$(create_node "P-000013" "Right Aileron"                  "Composite" "180"    "DWG-A126")
R_FLAP=$(   create_node "P-000014" "Right Flap"                     "Composite" "320"    "DWG-A127")
R_SLAT=$(   create_node "P-000015" "Right Slat"                     "Composite" "145"    "DWG-A128")
EMPENNAGE=$(create_node "P-000016" "Empennage Assembly"             "Composite" "2800"   "DWG-A130")
HORIZ_STB=$(create_node "P-000017" "Horizontal Stabilizer"         "Composite" "850"    "DWG-A131")
L_ELEV=$(   create_node "P-000018" "Left Elevator"                  "Composite" "190"    "DWG-A132")
R_ELEV=$(   create_node "P-000019" "Right Elevator"                 "Composite" "190"    "DWG-A133")
VERT_STB=$( create_node "P-000020" "Vertical Stabilizer"            "Composite" "620"    "DWG-A134")
RUDDER=$(   create_node "P-000021" "Rudder"                         "Composite" "210"    "DWG-A135")

# ── Propulsion ───────────────────────────────────────────────
PROP_SYS=$( create_node "P-000022" "Propulsion System"              ""          ""       "")
ENG_L=$(    create_node "P-000023" "Engine 1 - CFM LEAP-1A26"       "Steel"     "2852"   "DWG-B100")
ENG_L_FAN=$(create_node "P-000024" "Fan Module - Engine 1"          "Titanium"  "420"    "DWG-B101")
ENG_L_CMP=$(create_node "P-000025" "Compressor Module - Engine 1"   "Titanium"  "580"    "DWG-B102")
ENG_L_CMB=$(create_node "P-000026" "Combustion Chamber - Engine 1"  "Steel"     "240"    "DWG-B103")
ENG_L_TRB=$(create_node "P-000027" "Turbine Module - Engine 1"      "Steel"     "680"    "DWG-B104")
ENG_R=$(    create_node "P-000028" "Engine 2 - CFM LEAP-1A26"       "Steel"     "2852"   "DWG-B200")
ENG_R_FAN=$(create_node "P-000029" "Fan Module - Engine 2"          "Titanium"  "420"    "DWG-B201")
ENG_R_CMP=$(create_node "P-000030" "Compressor Module - Engine 2"   "Titanium"  "580"    "DWG-B202")
ENG_R_CMB=$(create_node "P-000031" "Combustion Chamber - Engine 2"  "Steel"     "240"    "DWG-B203")
ENG_R_TRB=$(create_node "P-000032" "Turbine Module - Engine 2"      "Steel"     "680"    "DWG-B204")
NACELLE_L=$(create_node "P-000033" "Nacelle Assembly - Left"        "Composite" "680"    "DWG-B300")
NACELLE_R=$(create_node "P-000034" "Nacelle Assembly - Right"       "Composite" "680"    "DWG-B301")
FUEL_SYS=$( create_node "P-000035" "Fuel System"                    ""          ""       "")
TANK_L=$(   create_node "P-000036" "Left Wing Tank"                 "Aluminum"  "145"    "DWG-B401")
TANK_R=$(   create_node "P-000037" "Right Wing Tank"                "Aluminum"  "145"    "DWG-B402")
TANK_C=$(   create_node "P-000038" "Center Tank"                    "Aluminum"  "280"    "DWG-B403")
FUEL_PUMPS=$(create_node "P-000039" "Fuel Pump Assembly"            "Steel"     "68"     "DWG-B404")

# ── Landing Gear ─────────────────────────────────────────────
LG_SYS=$(  create_node  "P-000040" "Landing Gear System"            ""          ""       "")
NLG=$(     create_node  "P-000041" "Nose Landing Gear"              "Steel"     "380"    "DWG-C100")
NLG_STRUT=$(create_node "P-000042" "Nose Gear Strut"                "Steel"     "180"    "DWG-C101")
NLG_WHEEL=$(create_node "P-000043" "Nose Wheel Assembly"            "Steel"     "95"     "DWG-C102")
MLG_L=$(   create_node  "P-000044" "Main Landing Gear - Left"       "Steel"     "720"    "DWG-C200")
MLG_L_STR=$(create_node "P-000045" "Main Gear Strut - Left"         "Steel"     "390"    "DWG-C201")
MLG_L_WHL=$(create_node "P-000046" "Main Wheel Assembly - Left"     "Steel"     "240"    "DWG-C202")
MLG_R=$(   create_node  "P-000047" "Main Landing Gear - Right"      "Steel"     "720"    "DWG-C300")
MLG_R_STR=$(create_node "P-000048" "Main Gear Strut - Right"        "Steel"     "390"    "DWG-C301")
MLG_R_WHL=$(create_node "P-000049" "Main Wheel Assembly - Right"    "Steel"     "240"    "DWG-C302")

# ── Avionics ─────────────────────────────────────────────────
AVI_SYS=$( create_node  "P-000050" "Avionics System"                ""          ""       "")
FMS=$(     create_node  "P-000051" "Flight Management System"       "Plastic"   "18"     "DWG-D100")
NAV_SYS=$( create_node  "P-000052" "Navigation System"              ""          ""       "")
GPS=$(     create_node  "P-000053" "GPS Unit"                       "Plastic"   "3"      "DWG-D201")
IRS=$(     create_node  "P-000054" "Inertial Reference System"      "Plastic"   "8"      "DWG-D202")
COMM_SYS=$(create_node  "P-000055" "Communication System"           ""          ""       "")
VHF=$(     create_node  "P-000056" "VHF Radio"                      "Plastic"   "4"      "DWG-D301")
HF=$(      create_node  "P-000057" "HF Radio"                       "Plastic"   "6"      "DWG-D302")
DISP_SYS=$(create_node  "P-000058" "Display System"                 ""          ""       "")
CAPT_PFD=$(create_node  "P-000059" "Captain Primary Flight Display" "Plastic"   "5"      "DWG-D401")
FO_PFD=$(  create_node  "P-000060" "First Officer PFD"              "Plastic"   "5"      "DWG-D402")
EICAS=$(   create_node  "P-000061" "EICAS Display"                  "Plastic"   "7"      "DWG-D403")

# ── Aircraft Systems ─────────────────────────────────────────
HYD_SYS=$( create_node  "P-000062" "Hydraulic System"               ""          ""       "")
HYD1=$(    create_node  "P-000063" "Hydraulic System 1"             "Steel"     "95"     "DWG-E101")
HYD2=$(    create_node  "P-000064" "Hydraulic System 2"             "Steel"     "95"     "DWG-E102")
HYD3=$(    create_node  "P-000065" "Hydraulic System 3"             "Steel"     "95"     "DWG-E103")
ELEC_SYS=$(create_node  "P-000066" "Electrical System"              ""          ""       "")
GEN1=$(    create_node  "P-000067" "Generator 1"                    "Steel"     "85"     "DWG-F101")
GEN2=$(    create_node  "P-000068" "Generator 2"                    "Steel"     "85"     "DWG-F102")
APU_GEN=$( create_node  "P-000069" "APU Generator"                  "Steel"     "120"    "DWG-F103")
ECS=$(     create_node  "P-000070" "Environmental Control System"   ""          ""       "")
ACP1=$(    create_node  "P-000071" "Air Conditioning Pack 1"        "Steel"     "180"    "DWG-G101")
ACP2=$(    create_node  "P-000072" "Air Conditioning Pack 2"        "Steel"     "180"    "DWG-G102")
FLT_CTRL=$(create_node  "P-000073" "Flight Controls"                ""          ""       "")
FBW=$(     create_node  "P-000074" "Fly-By-Wire Computer"           "Plastic"   "12"     "DWG-H101")
AUTO_PLT=$(create_node  "P-000075" "Auto Pilot System"              "Plastic"   "15"     "DWG-H102")

printf "\n"
NODE_COUNT=$(cat "$_NODE_CTR")
ok "$NODE_COUNT nodes created"

# ═════════════════════════════════════════════════════════════
# PHASE 2 — OPEN TRANSACTION
# ═════════════════════════════════════════════════════════════

printf "\n"
log "Opening transaction…"
TX_RESP=$(curl -sf -X POST "${BASE}${PSM}/transactions" \
  -H "Content-Type: application/json" \
  -H "X-PLM-User: $USER" \
  -H "X-PLM-ProjectSpace: $PS" \
  -d "{\"userId\":\"$USER\"}") \
  || fail "Failed to open transaction"

TX=$(echo "$TX_RESP" | json_str "txId")
[[ -z "$TX" ]] && fail "Empty txId (response: $TX_RESP)"
ok "Transaction opened: $TX"

# ═════════════════════════════════════════════════════════════
# PHASE 3 — CREATE LINKS
# ═════════════════════════════════════════════════════════════

printf "\n"
log "Creating links (product structure)…"

# Aircraft → top-level systems (8)
create_link "$AIRCRAFT"  "$AIRFRAME"   "LNK-001" "$TX"
create_link "$AIRCRAFT"  "$PROP_SYS"   "LNK-002" "$TX"
create_link "$AIRCRAFT"  "$LG_SYS"     "LNK-003" "$TX"
create_link "$AIRCRAFT"  "$AVI_SYS"    "LNK-004" "$TX"
create_link "$AIRCRAFT"  "$HYD_SYS"    "LNK-005" "$TX"
create_link "$AIRCRAFT"  "$ELEC_SYS"   "LNK-006" "$TX"
create_link "$AIRCRAFT"  "$ECS"        "LNK-007" "$TX"
create_link "$AIRCRAFT"  "$FLT_CTRL"   "LNK-008" "$TX"

# Airframe (11)
create_link "$AIRFRAME"  "$FUSELAGE"   "LNK-011" "$TX"
create_link "$AIRFRAME"  "$WING_ASSY"  "LNK-012" "$TX"
create_link "$AIRFRAME"  "$EMPENNAGE"  "LNK-013" "$TX"
create_link "$FUSELAGE"  "$FWD_FUS"    "LNK-021" "$TX"
create_link "$FUSELAGE"  "$CTR_FUS"    "LNK-022" "$TX"
create_link "$FUSELAGE"  "$AFT_FUS"    "LNK-023" "$TX"
create_link "$WING_ASSY" "$LEFT_WING"  "LNK-031" "$TX"
create_link "$WING_ASSY" "$RGHT_WING"  "LNK-032" "$TX"
create_link "$LEFT_WING" "$L_AILERON"  "LNK-033" "$TX"
create_link "$LEFT_WING" "$L_FLAP"     "LNK-034" "$TX"
create_link "$LEFT_WING" "$L_SLAT"     "LNK-035" "$TX"
create_link "$RGHT_WING" "$R_AILERON"  "LNK-036" "$TX"
create_link "$RGHT_WING" "$R_FLAP"     "LNK-037" "$TX"
create_link "$RGHT_WING" "$R_SLAT"     "LNK-038" "$TX"
create_link "$EMPENNAGE" "$HORIZ_STB"  "LNK-041" "$TX"
create_link "$EMPENNAGE" "$VERT_STB"   "LNK-042" "$TX"
create_link "$HORIZ_STB" "$L_ELEV"     "LNK-043" "$TX"
create_link "$HORIZ_STB" "$R_ELEV"     "LNK-044" "$TX"
create_link "$VERT_STB"  "$RUDDER"     "LNK-045" "$TX"

# Propulsion (17)
create_link "$PROP_SYS"  "$ENG_L"      "LNK-051" "$TX"
create_link "$PROP_SYS"  "$ENG_R"      "LNK-052" "$TX"
create_link "$PROP_SYS"  "$NACELLE_L"  "LNK-053" "$TX"
create_link "$PROP_SYS"  "$NACELLE_R"  "LNK-054" "$TX"
create_link "$PROP_SYS"  "$FUEL_SYS"   "LNK-055" "$TX"
create_link "$ENG_L"     "$ENG_L_FAN"  "LNK-061" "$TX"
create_link "$ENG_L"     "$ENG_L_CMP"  "LNK-062" "$TX"
create_link "$ENG_L"     "$ENG_L_CMB"  "LNK-063" "$TX"
create_link "$ENG_L"     "$ENG_L_TRB"  "LNK-064" "$TX"
create_link "$ENG_R"     "$ENG_R_FAN"  "LNK-065" "$TX"
create_link "$ENG_R"     "$ENG_R_CMP"  "LNK-066" "$TX"
create_link "$ENG_R"     "$ENG_R_CMB"  "LNK-067" "$TX"
create_link "$ENG_R"     "$ENG_R_TRB"  "LNK-068" "$TX"
create_link "$FUEL_SYS"  "$TANK_L"     "LNK-071" "$TX"
create_link "$FUEL_SYS"  "$TANK_R"     "LNK-072" "$TX"
create_link "$FUEL_SYS"  "$TANK_C"     "LNK-073" "$TX"
create_link "$FUEL_SYS"  "$FUEL_PUMPS" "LNK-074" "$TX"

# Landing Gear (9)
create_link "$LG_SYS"    "$NLG"        "LNK-081" "$TX"
create_link "$LG_SYS"    "$MLG_L"      "LNK-082" "$TX"
create_link "$LG_SYS"    "$MLG_R"      "LNK-083" "$TX"
create_link "$NLG"       "$NLG_STRUT"  "LNK-084" "$TX"
create_link "$NLG"       "$NLG_WHEEL"  "LNK-085" "$TX"
create_link "$MLG_L"     "$MLG_L_STR"  "LNK-086" "$TX"
create_link "$MLG_L"     "$MLG_L_WHL"  "LNK-087" "$TX"
create_link "$MLG_R"     "$MLG_R_STR"  "LNK-088" "$TX"
create_link "$MLG_R"     "$MLG_R_WHL"  "LNK-089" "$TX"

# Avionics (11)
create_link "$AVI_SYS"   "$FMS"        "LNK-091" "$TX"
create_link "$AVI_SYS"   "$NAV_SYS"    "LNK-092" "$TX"
create_link "$AVI_SYS"   "$COMM_SYS"   "LNK-093" "$TX"
create_link "$AVI_SYS"   "$DISP_SYS"   "LNK-094" "$TX"
create_link "$NAV_SYS"   "$GPS"        "LNK-095" "$TX"
create_link "$NAV_SYS"   "$IRS"        "LNK-096" "$TX"
create_link "$COMM_SYS"  "$VHF"        "LNK-097" "$TX"
create_link "$COMM_SYS"  "$HF"         "LNK-098" "$TX"
create_link "$DISP_SYS"  "$CAPT_PFD"   "LNK-099" "$TX"
create_link "$DISP_SYS"  "$FO_PFD"     "LNK-100" "$TX"
create_link "$DISP_SYS"  "$EICAS"      "LNK-101" "$TX"

# Aircraft Systems (10)
create_link "$HYD_SYS"   "$HYD1"       "LNK-111" "$TX"
create_link "$HYD_SYS"   "$HYD2"       "LNK-112" "$TX"
create_link "$HYD_SYS"   "$HYD3"       "LNK-113" "$TX"
create_link "$ELEC_SYS"  "$GEN1"       "LNK-121" "$TX"
create_link "$ELEC_SYS"  "$GEN2"       "LNK-122" "$TX"
create_link "$ELEC_SYS"  "$APU_GEN"    "LNK-123" "$TX"
create_link "$ECS"       "$ACP1"       "LNK-131" "$TX"
create_link "$ECS"       "$ACP2"       "LNK-132" "$TX"
create_link "$FLT_CTRL"  "$FBW"        "LNK-141" "$TX"
create_link "$FLT_CTRL"  "$AUTO_PLT"   "LNK-142" "$TX"

ok "$LINK_COUNT links created"

# ═════════════════════════════════════════════════════════════
# PHASE 4 — COMMIT
# ═════════════════════════════════════════════════════════════

printf "\n"
log "Committing transaction…"
curl -sf -X POST "${BASE}${PSM}/transactions/${TX}/commit" \
  -H "Content-Type: application/json" \
  -H "X-PLM-User: $USER" \
  -H "X-PLM-ProjectSpace: $PS" \
  -d "{\"userId\":\"$USER\",\"comment\":\"Demo: Aircraft A320-Neo product breakdown structure (${NODE_COUNT} parts, ${LINK_COUNT} links)\"}" \
  > /dev/null \
  || fail "Failed to commit transaction $TX"
ok "Transaction committed"

# ═════════════════════════════════════════════════════════════
# DONE
# ═════════════════════════════════════════════════════════════

printf "\n"
printf "${BOLD}╔═══════════════════════════════════════════════════════════╗${NC}\n"
printf "${BOLD}║  Demo complete!                                           ║${NC}\n"
printf "${BOLD}║                                                           ║${NC}\n"
printf "${BOLD}║  %2d nodes created (Parts)                               ║${NC}\n" "$NODE_COUNT"
printf "${BOLD}║  %2d links created (composed_of)                         ║${NC}\n" "$LINK_COUNT"
printf "${BOLD}║                                                           ║${NC}\n"
printf "${BOLD}║  Structure:                                               ║${NC}\n"
printf "${BOLD}║    Aircraft A320-Neo                                      ║${NC}\n"
printf "${BOLD}║    ├── Airframe (fuselage, wings, empennage)              ║${NC}\n"
printf "${BOLD}║    ├── Propulsion (2 engines, nacelles, fuel)             ║${NC}\n"
printf "${BOLD}║    ├── Landing Gear (nose + 2 main)                       ║${NC}\n"
printf "${BOLD}║    ├── Avionics (FMS, nav, comm, displays)                ║${NC}\n"
printf "${BOLD}║    ├── Hydraulic System (3 circuits)                      ║${NC}\n"
printf "${BOLD}║    ├── Electrical System (generators + APU)               ║${NC}\n"
printf "${BOLD}║    ├── Environmental Control (2 packs)                    ║${NC}\n"
printf "${BOLD}║    └── Flight Controls (FBW + autopilot)                  ║${NC}\n"
printf "${BOLD}║                                                           ║${NC}\n"
if [[ "${1:-}" == "--local" ]]; then
printf "${BOLD}║  Open http://localhost:5173 to explore                    ║${NC}\n"
else
printf "${BOLD}║  Open ${BASE} to explore              ║${NC}\n"
fi
printf "${BOLD}╚═══════════════════════════════════════════════════════════╝${NC}\n\n"
