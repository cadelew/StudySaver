import path from "path";
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";
import type { Configuration } from "webpack";
import webpack from "webpack";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);

function applyAliases(config: Configuration) {
  const projectRoot = process.cwd();
  const appRoot = path.resolve(projectRoot, "..");
  const framerStub = path.join(projectRoot, "src/stubs/framer-motion.tsx");
  const moneyStub = path.join(projectRoot, "src/stubs/money-display.tsx");
  const savingsStub = path.join(projectRoot, "src/stubs/savings-ticker.tsx");

  config.resolve = config.resolve ?? {};
  config.resolve.modules = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(appRoot, "node_modules"),
    ...(config.resolve.modules ?? ["node_modules"]),
  ];
  config.resolve.alias = {
    ...(config.resolve.alias as Record<string, string>),
    "@/components/ui/money-display": moneyStub,
    "@/components/deals/SavingsTicker": savingsStub,
    "framer-motion": framerStub,
    "@": appRoot,
  };

  config.plugins = config.plugins ?? [];
  config.plugins.push(
    new webpack.NormalModuleReplacementPlugin(/^framer-motion$/, framerStub),
    new webpack.NormalModuleReplacementPlugin(
      /^@\/components\/ui\/money-display$/,
      moneyStub,
    ),
    new webpack.NormalModuleReplacementPlugin(
      /^@\/components\/deals\/SavingsTicker$/,
      savingsStub,
    ),
  );

  return config;
}

Config.overrideWebpackConfig((config) => {
  applyAliases(config);
  return applyAliases(enableTailwind(config));
});
