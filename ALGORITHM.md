# Workout generation and anatomy coverage notes

The implementation in `src/lib/planner.ts` is a deterministic **heuristic**. It is designed for accessible variation and muscle-group distribution, **not clinically validated training optimization**.

## Source of truth

Each movement's ID, setting, category, muscles and safety note comes directly from the provided exercise atlas. The source data is imported without inventing new anatomical muscle correlations. Do not assume the mapping has experimentally measured EMG or fiber-specific recruitment.

## Scheduling sequence

1. Read the user's completed sessions (in cloud mode these are account-linked; offline demo saves only to one browser).
2. Define target regions for eight slots: chest/shoulder, back, thigh/knee, hip/glutes, core, calves/ankles, arms and one rotating extra slot (hands/wrists, neck, pelvic floor, breathing).
3. Find candidates classified as compound, band, isolation, isometric, eccentric strength or selected functional/motor-control movements. Exclude involuntary/specialized areas such as eyes, ears, face and throat from automatic strength prescription. They remain available in the educational library.
4. Score candidates for novelty and time since last selection. Apply a penalty when their primary muscles have accumulated many recent appearances; distribute exercise regions. Gym mode prefers gym-labeled strength exercises but also uses suitable home-labeled movements.
5. **Hard isolation guard**: when a selected exercise is labeled `Isolation strength`, another chosen exercise must not recruit the isolated primary muscle as a **primary or assisting** (fatiguing) muscle in that same session. Incidental stabilizer involvement is not treated as an isolation conflict; otherwise it may be impossible to build a balanced routine.
6. Choose four warm-up stretches and four cool-down stretches from stretch and mobility categories, preferring overlap with muscles selected for strength and avoiding very recent stretch repetition. Warm-up favors dynamic/active movements; cool-down favors passive/hold stretches. Both phases include category diversity where possible.
7. Build 16 stable exercise slots. Strength = three sets; stretches = one checkbox each. Store the full plan and set-specific metrics so historic loads are not lost when source content changes.

## Set prescriptions

| Activity | Default |
|---|---|
| Normal strength, including isolation, compound, band, eccentric | 3 sets × 6 controlled reps |
| Isometric strength | 3 sets × 30 seconds |
| Static / passive stretch | 15 slow breaths |
| Active / mobility stretch | 5 slow movements |

The user's required defaults override the original worksheet's generic sample dosage **only for plan display**. Original dosage remains preserved in the searchable library. These one-size-fits-all defaults should be reviewed by an exercise professional before being presented as individualized prescriptions.

## Per-set logging

- Every set has a completion boolean. Completed sets turn green.
- Gym-labeled non-band strength: weight in kilograms per set (0 means no added resistance).
- Band-labeled strength: **light / medium / heavy** and count of bands per set. Band color or perceived resistance does not correspond reliably to a particular force; no such force is inferred.
- Stretch sets: one completion checkbox per stretch.
- Progress is `checked sets / all required, non-skipped sets`. A skip requires an explicit confirmation and a selected reason, and the slot disappears from today's active list.
- Completing a session requires all remaining prescribed sets and at least four completed strength exercises. Completion awards 20 recreational XP once per session via the Supabase `finish_workout` RPC. This is **not** tamper-proof against client-forged plans and is unsuitable for financial rewards.

## Progress atlas

- Region color increases with how often a **completed primary strength exercise** appears within that region.
- The anatomical list shows per-muscle occurrences: each completed exercise whose `primary` list contains a muscle contributes **1**, and an `assisting` appearance contributes **0.5**. Stabilizers and stretches are not counted as a main strength exposure. Counts are approximate activity history, not hypertrophy or objective training dose.
- Hovering, focusing or tapping a body region shows the most recent recorded exercise sets and loads. Per-set weights and band levels are retained in the session plan.
- The human SVG is **schematic** and represents broad regions, not individual deep muscles or their anatomical boundaries. For the full 349 anatomical entries, use searchable entries below the body map.

## Spacing and limitations

Previously skipped exercises are withheld from later plans for **2 days** when marked 'I can't do this exercise today', or **30 days** when marked 'This exercise seems dangerous or unsafe'. This is a scheduling precaution, not an injury evaluation or permanent medical contraindication.

The planner encourages **variety** rather than guaranteeing the optimal interval for tendon, ligament, muscle or nervous-system recovery. Its score does not yet incorporate intensity, pain, illness, injury restrictions, exercise technique, individual health conditions, age, sleep or recovery. It does **not** assure that every one of the 349 muscles is appropriately stimulated or that all 376 activities will be automatically prescribed. Specialized involuntary/functional muscle tasks remain educational-only, and uncommon movements may be limited by hard region-balancing rules.

Ligaments are passive connective tissues, **not targets for deliberate stretching**. Existing worksheet ligament descriptions are contextual only. Resistance-band ratings are subjective, not calibrated force. Particularly concerning user skip reasons are not transmitted to a clinician or automatically reviewed. The app does not prevent every contraindicated movement; all exercise decisions require common-sense judgment and, where appropriate, professional advice.

## Future algorithm improvements

For a more advanced release, consider per-user safety screening; mobility/strength goals; equipment inventory; rest-day cadence; recovery and soreness inputs; progressive overload with weights and RPE; named plans for accessibility needs; per-muscle exponential-decay exposure weighting; exercise movement-pattern classification; user feedback on each recommendation; a server-signed workout plan and anti-tamper validation; and dedicated review of the anatomical and exercise taxonomy by clinicians/fitness professionals.
