workflow "Main" {
  on = "push"
  resolves = ["Build and Test"]
}

action "Build and Test" {
  uses = "./.github/action/"
  secrets = ["NPM_TOKEN"]
}
