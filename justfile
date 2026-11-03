# Show the 100 most recent Claude prompts
claude-history:
    @tail -n 100 ~/.claude_global_prompts.log

# Typecheck, lint, and test — run before every commit
check:
    yarn typecheck && yarn lint && yarn test

# Run the app
start:
    yarn start

ios:
    yarn ios

android:
    yarn android
