# Lottie Sandbox Assets

Both Lottie files embed the Sullie mascot SVG (from `assets/sullie - svg.svg`,
© Awesome Motive / WPForms — internal repo use only) as a base64 image asset
on a Lottie image layer. Animation is driven by transform/opacity keyframes
on the layer; the Sullie artwork itself is unmodified.

`bumper.json` — 60 frames @ 30fps. Scale-in with overshoot, settle, soft hold.

`badge.json` — 120 frames @ 30fps with embedded markers (`enter`@0,
`hold`@30, `exit`@90) for marker-driven scrubbing examples. Adds slight
rotation through the sequence.
