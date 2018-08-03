var puppeteer = require("puppeteer");

module.exports = {
  src_folders: "test/specs",
  output_folder: "reports",
  custom_assertions_path: "test/custom_assertions",
  custom_commands_path: "test/commands",
  globals_path: "test/globals/local.js",

  selenium: {
    start_process: false
  },

  test_settings: {
    default: {
      launch_url: "http://localhost:5000",
      selenium_port: 9515,
      selenium_host: "localhost",
      default_path_prefix: "",
      skip_testcases_on_fail: false,

      desiredCapabilities: {
        browserName: "chrome",
        chromeOptions: {
          args: ["--no-sandbox"]
        },
        acceptSslCerts: true
      }
    },

    docker: {
      launch_url: "http://cla_public",
      desiredCapabilities: {
        chromeOptions: {
          args: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
          binary: puppeteer.executablePath()
        }
      }
    }
  }
};
