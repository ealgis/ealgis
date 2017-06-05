DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.gccsa_2011_aust_pow_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.gccsa_2011_aust_pow_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.gccsa_2011_aust_pow AS geomtable;
CREATE INDEX "gccsa_2011_aust_pow_view_geom_4326_z5_gist" ON "aus_census_2011"."gccsa_2011_aust_pow_view" USING GIST ("geom_4326_z5");
CREATE INDEX "gccsa_2011_aust_pow_view_geom_4326_z7_gist" ON "aus_census_2011"."gccsa_2011_aust_pow_view" USING GIST ("geom_4326_z7");
CREATE INDEX "gccsa_2011_aust_pow_view_geom_4326_z9_gist" ON "aus_census_2011"."gccsa_2011_aust_pow_view" USING GIST ("geom_4326_z9");
CREATE INDEX "gccsa_2011_aust_pow_view_geom_4326_z11_gist" ON "aus_census_2011"."gccsa_2011_aust_pow_view" USING GIST ("geom_4326_z11");
CREATE INDEX "gccsa_2011_aust_pow_view_geom_4326_gist" ON "aus_census_2011"."gccsa_2011_aust_pow_view" USING GIST ("geom_4326");
CREATE UNIQUE INDEX "gccsa_2011_aust_pow_view_gccsa_code_idx" ON "aus_census_2011"."gccsa_2011_aust_pow_view" ("gccsa_code");
CREATE INDEX "gccsa_2011_aust_pow_view_geom_3112_gist" ON "aus_census_2011"."gccsa_2011_aust_pow_view" USING gist ("geom_3112");
CREATE INDEX "gccsa_2011_aust_pow_view_geom_3857_gist" ON "aus_census_2011"."gccsa_2011_aust_pow_view" USING gist ("geom_3857");
CREATE INDEX "gccsa_2011_aust_pow_view_geom_idx" ON "aus_census_2011"."gccsa_2011_aust_pow_view" USING gist ("geom");
CREATE UNIQUE INDEX "gccsa_2011_aust_pow_view_gid_idx" ON "aus_census_2011"."gccsa_2011_aust_pow_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.lga_2011_aust_pow_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.lga_2011_aust_pow_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.lga_2011_aust_pow AS geomtable;
CREATE INDEX "lga_2011_aust_pow_view_geom_4326_z5_gist" ON "aus_census_2011"."lga_2011_aust_pow_view" USING GIST ("geom_4326_z5");
CREATE INDEX "lga_2011_aust_pow_view_geom_4326_z7_gist" ON "aus_census_2011"."lga_2011_aust_pow_view" USING GIST ("geom_4326_z7");
CREATE INDEX "lga_2011_aust_pow_view_geom_4326_z9_gist" ON "aus_census_2011"."lga_2011_aust_pow_view" USING GIST ("geom_4326_z9");
CREATE INDEX "lga_2011_aust_pow_view_geom_4326_z11_gist" ON "aus_census_2011"."lga_2011_aust_pow_view" USING GIST ("geom_4326_z11");
CREATE INDEX "lga_2011_aust_pow_view_geom_4326_gist" ON "aus_census_2011"."lga_2011_aust_pow_view" USING GIST ("geom_4326");
CREATE INDEX "lga_2011_aust_pow_view_geom_3112_gist" ON "aus_census_2011"."lga_2011_aust_pow_view" USING gist ("geom_3112");
CREATE INDEX "lga_2011_aust_pow_view_geom_3857_gist" ON "aus_census_2011"."lga_2011_aust_pow_view" USING gist ("geom_3857");
CREATE INDEX "lga_2011_aust_pow_view_geom_idx" ON "aus_census_2011"."lga_2011_aust_pow_view" USING gist ("geom");
CREATE UNIQUE INDEX "lga_2011_aust_pow_view_lga_code_idx" ON "aus_census_2011"."lga_2011_aust_pow_view" ("lga_code");
CREATE UNIQUE INDEX "lga_2011_aust_pow_view_gid_idx" ON "aus_census_2011"."lga_2011_aust_pow_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sa2_2011_aust_pow_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sa2_2011_aust_pow_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sa2_2011_aust_pow AS geomtable;
CREATE INDEX "sa2_2011_aust_pow_view_geom_4326_z5_gist" ON "aus_census_2011"."sa2_2011_aust_pow_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sa2_2011_aust_pow_view_geom_4326_z7_gist" ON "aus_census_2011"."sa2_2011_aust_pow_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sa2_2011_aust_pow_view_geom_4326_z9_gist" ON "aus_census_2011"."sa2_2011_aust_pow_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sa2_2011_aust_pow_view_geom_4326_z11_gist" ON "aus_census_2011"."sa2_2011_aust_pow_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sa2_2011_aust_pow_view_geom_4326_gist" ON "aus_census_2011"."sa2_2011_aust_pow_view" USING GIST ("geom_4326");
CREATE INDEX "sa2_2011_aust_pow_view_geom_3112_gist" ON "aus_census_2011"."sa2_2011_aust_pow_view" USING gist ("geom_3112");
CREATE INDEX "sa2_2011_aust_pow_view_geom_3857_gist" ON "aus_census_2011"."sa2_2011_aust_pow_view" USING gist ("geom_3857");
CREATE INDEX "sa2_2011_aust_pow_view_geom_idx" ON "aus_census_2011"."sa2_2011_aust_pow_view" USING gist ("geom");
CREATE UNIQUE INDEX "sa2_2011_aust_pow_view_sa2_main_idx" ON "aus_census_2011"."sa2_2011_aust_pow_view" ("sa2_main");
CREATE UNIQUE INDEX "sa2_2011_aust_pow_view_gid_idx" ON "aus_census_2011"."sa2_2011_aust_pow_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sa3_2011_aust_pow_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sa3_2011_aust_pow_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sa3_2011_aust_pow AS geomtable;
CREATE INDEX "sa3_2011_aust_pow_view_geom_4326_z5_gist" ON "aus_census_2011"."sa3_2011_aust_pow_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sa3_2011_aust_pow_view_geom_4326_z7_gist" ON "aus_census_2011"."sa3_2011_aust_pow_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sa3_2011_aust_pow_view_geom_4326_z9_gist" ON "aus_census_2011"."sa3_2011_aust_pow_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sa3_2011_aust_pow_view_geom_4326_z11_gist" ON "aus_census_2011"."sa3_2011_aust_pow_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sa3_2011_aust_pow_view_geom_4326_gist" ON "aus_census_2011"."sa3_2011_aust_pow_view" USING GIST ("geom_4326");
CREATE INDEX "sa3_2011_aust_pow_view_geom_3112_gist" ON "aus_census_2011"."sa3_2011_aust_pow_view" USING gist ("geom_3112");
CREATE INDEX "sa3_2011_aust_pow_view_geom_3857_gist" ON "aus_census_2011"."sa3_2011_aust_pow_view" USING gist ("geom_3857");
CREATE INDEX "sa3_2011_aust_pow_view_geom_idx" ON "aus_census_2011"."sa3_2011_aust_pow_view" USING gist ("geom");
CREATE UNIQUE INDEX "sa3_2011_aust_pow_view_sa3_code_idx" ON "aus_census_2011"."sa3_2011_aust_pow_view" ("sa3_code");
CREATE UNIQUE INDEX "sa3_2011_aust_pow_view_gid_idx" ON "aus_census_2011"."sa3_2011_aust_pow_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sa4_2011_aust_pow_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sa4_2011_aust_pow_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sa4_2011_aust_pow AS geomtable;
CREATE INDEX "sa4_2011_aust_pow_view_geom_4326_z5_gist" ON "aus_census_2011"."sa4_2011_aust_pow_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sa4_2011_aust_pow_view_geom_4326_z7_gist" ON "aus_census_2011"."sa4_2011_aust_pow_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sa4_2011_aust_pow_view_geom_4326_z9_gist" ON "aus_census_2011"."sa4_2011_aust_pow_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sa4_2011_aust_pow_view_geom_4326_z11_gist" ON "aus_census_2011"."sa4_2011_aust_pow_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sa4_2011_aust_pow_view_geom_4326_gist" ON "aus_census_2011"."sa4_2011_aust_pow_view" USING GIST ("geom_4326");
CREATE INDEX "sa4_2011_aust_pow_view_geom_3112_gist" ON "aus_census_2011"."sa4_2011_aust_pow_view" USING gist ("geom_3112");
CREATE INDEX "sa4_2011_aust_pow_view_geom_3857_gist" ON "aus_census_2011"."sa4_2011_aust_pow_view" USING gist ("geom_3857");
CREATE INDEX "sa4_2011_aust_pow_view_geom_idx" ON "aus_census_2011"."sa4_2011_aust_pow_view" USING gist ("geom");
CREATE UNIQUE INDEX "sa4_2011_aust_pow_view_sa4_code_idx" ON "aus_census_2011"."sa4_2011_aust_pow_view" ("sa4_code");
CREATE UNIQUE INDEX "sa4_2011_aust_pow_view_gid_idx" ON "aus_census_2011"."sa4_2011_aust_pow_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sla_2011_aust_pow_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sla_2011_aust_pow_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sla_2011_aust_pow AS geomtable;
CREATE INDEX "sla_2011_aust_pow_view_geom_4326_z5_gist" ON "aus_census_2011"."sla_2011_aust_pow_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sla_2011_aust_pow_view_geom_4326_z7_gist" ON "aus_census_2011"."sla_2011_aust_pow_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sla_2011_aust_pow_view_geom_4326_z9_gist" ON "aus_census_2011"."sla_2011_aust_pow_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sla_2011_aust_pow_view_geom_4326_z11_gist" ON "aus_census_2011"."sla_2011_aust_pow_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sla_2011_aust_pow_view_geom_4326_gist" ON "aus_census_2011"."sla_2011_aust_pow_view" USING GIST ("geom_4326");
CREATE INDEX "sla_2011_aust_pow_view_geom_3112_gist" ON "aus_census_2011"."sla_2011_aust_pow_view" USING gist ("geom_3112");
CREATE INDEX "sla_2011_aust_pow_view_geom_3857_gist" ON "aus_census_2011"."sla_2011_aust_pow_view" USING gist ("geom_3857");
CREATE INDEX "sla_2011_aust_pow_view_geom_idx" ON "aus_census_2011"."sla_2011_aust_pow_view" USING gist ("geom");
CREATE UNIQUE INDEX "sla_2011_aust_pow_view_sla_main_idx" ON "aus_census_2011"."sla_2011_aust_pow_view" ("sla_main");
CREATE UNIQUE INDEX "sla_2011_aust_pow_view_gid_idx" ON "aus_census_2011"."sla_2011_aust_pow_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.ste_2011_aust_pow_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.ste_2011_aust_pow_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.ste_2011_aust_pow AS geomtable;
CREATE INDEX "ste_2011_aust_pow_view_geom_4326_z5_gist" ON "aus_census_2011"."ste_2011_aust_pow_view" USING GIST ("geom_4326_z5");
CREATE INDEX "ste_2011_aust_pow_view_geom_4326_z7_gist" ON "aus_census_2011"."ste_2011_aust_pow_view" USING GIST ("geom_4326_z7");
CREATE INDEX "ste_2011_aust_pow_view_geom_4326_z9_gist" ON "aus_census_2011"."ste_2011_aust_pow_view" USING GIST ("geom_4326_z9");
CREATE INDEX "ste_2011_aust_pow_view_geom_4326_z11_gist" ON "aus_census_2011"."ste_2011_aust_pow_view" USING GIST ("geom_4326_z11");
CREATE INDEX "ste_2011_aust_pow_view_geom_4326_gist" ON "aus_census_2011"."ste_2011_aust_pow_view" USING GIST ("geom_4326");
CREATE INDEX "ste_2011_aust_pow_view_geom_3112_gist" ON "aus_census_2011"."ste_2011_aust_pow_view" USING gist ("geom_3112");
CREATE INDEX "ste_2011_aust_pow_view_geom_3857_gist" ON "aus_census_2011"."ste_2011_aust_pow_view" USING gist ("geom_3857");
CREATE INDEX "ste_2011_aust_pow_view_geom_idx" ON "aus_census_2011"."ste_2011_aust_pow_view" USING gist ("geom");
CREATE UNIQUE INDEX "ste_2011_aust_pow_view_state_code_idx" ON "aus_census_2011"."ste_2011_aust_pow_view" ("state_code");
CREATE UNIQUE INDEX "ste_2011_aust_pow_view_gid_idx" ON "aus_census_2011"."ste_2011_aust_pow_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.ced_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.ced_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.ced_2011_aust AS geomtable;
CREATE INDEX "ced_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."ced_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "ced_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."ced_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "ced_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."ced_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "ced_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."ced_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "ced_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."ced_2011_aust_view" USING GIST ("geom_4326");
CREATE UNIQUE INDEX "ced_2011_aust_view_ced_code_idx" ON "aus_census_2011"."ced_2011_aust_view" ("ced_code");
CREATE INDEX "ced_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."ced_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "ced_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."ced_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "ced_2011_aust_view_geom_idx" ON "aus_census_2011"."ced_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "ced_2011_aust_view_gid_idx" ON "aus_census_2011"."ced_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.iare_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.iare_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.iare_2011_aust AS geomtable;
CREATE INDEX "iare_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."iare_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "iare_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."iare_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "iare_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."iare_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "iare_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."iare_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "iare_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."iare_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "iare_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."iare_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "iare_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."iare_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "iare_2011_aust_view_geom_idx" ON "aus_census_2011"."iare_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "iare_2011_aust_view_iare_code_idx" ON "aus_census_2011"."iare_2011_aust_view" ("iare_code");
CREATE UNIQUE INDEX "iare_2011_aust_view_gid_idx" ON "aus_census_2011"."iare_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.iloc_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.iloc_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.iloc_2011_aust AS geomtable;
CREATE INDEX "iloc_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."iloc_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "iloc_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."iloc_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "iloc_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."iloc_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "iloc_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."iloc_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "iloc_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."iloc_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "iloc_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."iloc_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "iloc_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."iloc_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "iloc_2011_aust_view_geom_idx" ON "aus_census_2011"."iloc_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "iloc_2011_aust_view_iloc_code_idx" ON "aus_census_2011"."iloc_2011_aust_view" ("iloc_code");
CREATE UNIQUE INDEX "iloc_2011_aust_view_gid_idx" ON "aus_census_2011"."iloc_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.ireg_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.ireg_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.ireg_2011_aust AS geomtable;
CREATE INDEX "ireg_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."ireg_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "ireg_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."ireg_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "ireg_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."ireg_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "ireg_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."ireg_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "ireg_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."ireg_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "ireg_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."ireg_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "ireg_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."ireg_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "ireg_2011_aust_view_geom_idx" ON "aus_census_2011"."ireg_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "ireg_2011_aust_view_ireg_code_idx" ON "aus_census_2011"."ireg_2011_aust_view" ("ireg_code");
CREATE UNIQUE INDEX "ireg_2011_aust_view_gid_idx" ON "aus_census_2011"."ireg_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.poa_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.poa_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.poa_2011_aust AS geomtable;
CREATE INDEX "poa_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."poa_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "poa_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."poa_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "poa_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."poa_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "poa_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."poa_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "poa_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."poa_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "poa_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."poa_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "poa_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."poa_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "poa_2011_aust_view_geom_idx" ON "aus_census_2011"."poa_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "poa_2011_aust_view_poa_code_idx" ON "aus_census_2011"."poa_2011_aust_view" ("poa_code");
CREATE UNIQUE INDEX "poa_2011_aust_view_gid_idx" ON "aus_census_2011"."poa_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.ra_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.ra_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.ra_2011_aust AS geomtable;
CREATE INDEX "ra_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."ra_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "ra_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."ra_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "ra_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."ra_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "ra_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."ra_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "ra_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."ra_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "ra_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."ra_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "ra_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."ra_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "ra_2011_aust_view_geom_idx" ON "aus_census_2011"."ra_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "ra_2011_aust_view_ra_code_idx" ON "aus_census_2011"."ra_2011_aust_view" ("ra_code");
CREATE UNIQUE INDEX "ra_2011_aust_view_gid_idx" ON "aus_census_2011"."ra_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sa1_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sa1_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sa1_2011_aust AS geomtable;
CREATE INDEX "sa1_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."sa1_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sa1_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."sa1_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sa1_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."sa1_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sa1_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."sa1_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sa1_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."sa1_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "sa1_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."sa1_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "sa1_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."sa1_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "sa1_2011_aust_view_geom_idx" ON "aus_census_2011"."sa1_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "sa1_2011_aust_view_sa1_7digit_idx" ON "aus_census_2011"."sa1_2011_aust_view" ("sa1_7digit");
CREATE UNIQUE INDEX "sa1_2011_aust_view_gid_idx" ON "aus_census_2011"."sa1_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sed_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sed_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sed_2011_aust AS geomtable;
CREATE INDEX "sed_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."sed_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sed_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."sed_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sed_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."sed_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sed_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."sed_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sed_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."sed_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "sed_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."sed_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "sed_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."sed_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "sed_2011_aust_view_geom_idx" ON "aus_census_2011"."sed_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "sed_2011_aust_view_sed_code_idx" ON "aus_census_2011"."sed_2011_aust_view" ("sed_code");
CREATE UNIQUE INDEX "sed_2011_aust_view_gid_idx" ON "aus_census_2011"."sed_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sos_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sos_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sos_2011_aust AS geomtable;
CREATE INDEX "sos_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."sos_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sos_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."sos_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sos_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."sos_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sos_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."sos_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sos_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."sos_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "sos_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."sos_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "sos_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."sos_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "sos_2011_aust_view_geom_idx" ON "aus_census_2011"."sos_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "sos_2011_aust_view_sos_code_idx" ON "aus_census_2011"."sos_2011_aust_view" ("sos_code");
CREATE UNIQUE INDEX "sos_2011_aust_view_gid_idx" ON "aus_census_2011"."sos_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sosr_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sosr_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sosr_2011_aust AS geomtable;
CREATE INDEX "sosr_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."sosr_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sosr_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."sosr_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sosr_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."sosr_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sosr_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."sosr_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sosr_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."sosr_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "sosr_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."sosr_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "sosr_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."sosr_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "sosr_2011_aust_view_geom_idx" ON "aus_census_2011"."sosr_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "sosr_2011_aust_view_sosr_code_idx" ON "aus_census_2011"."sosr_2011_aust_view" ("sosr_code");
CREATE UNIQUE INDEX "sosr_2011_aust_view_gid_idx" ON "aus_census_2011"."sosr_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.ssc_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.ssc_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.ssc_2011_aust AS geomtable;
CREATE INDEX "ssc_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."ssc_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "ssc_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."ssc_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "ssc_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."ssc_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "ssc_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."ssc_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "ssc_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."ssc_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "ssc_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."ssc_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "ssc_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."ssc_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "ssc_2011_aust_view_geom_idx" ON "aus_census_2011"."ssc_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "ssc_2011_aust_view_ssc_code_idx" ON "aus_census_2011"."ssc_2011_aust_view" ("ssc_code");
CREATE UNIQUE INDEX "ssc_2011_aust_view_gid_idx" ON "aus_census_2011"."ssc_2011_aust_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.sua_2011_aust01_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.sua_2011_aust01_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.sua_2011_aust01 AS geomtable;
CREATE INDEX "sua_2011_aust01_view_geom_4326_z5_gist" ON "aus_census_2011"."sua_2011_aust01_view" USING GIST ("geom_4326_z5");
CREATE INDEX "sua_2011_aust01_view_geom_4326_z7_gist" ON "aus_census_2011"."sua_2011_aust01_view" USING GIST ("geom_4326_z7");
CREATE INDEX "sua_2011_aust01_view_geom_4326_z9_gist" ON "aus_census_2011"."sua_2011_aust01_view" USING GIST ("geom_4326_z9");
CREATE INDEX "sua_2011_aust01_view_geom_4326_z11_gist" ON "aus_census_2011"."sua_2011_aust01_view" USING GIST ("geom_4326_z11");
CREATE INDEX "sua_2011_aust01_view_geom_4326_gist" ON "aus_census_2011"."sua_2011_aust01_view" USING GIST ("geom_4326");
CREATE INDEX "sua_2011_aust01_view_geom_3112_gist" ON "aus_census_2011"."sua_2011_aust01_view" USING gist ("geom_3112");
CREATE INDEX "sua_2011_aust01_view_geom_3857_gist" ON "aus_census_2011"."sua_2011_aust01_view" USING gist ("geom_3857");
CREATE INDEX "sua_2011_aust01_view_geom_idx" ON "aus_census_2011"."sua_2011_aust01_view" USING gist ("geom");
CREATE UNIQUE INDEX "sua_2011_aust01_view_sua_code_idx" ON "aus_census_2011"."sua_2011_aust01_view" ("sua_code");
CREATE UNIQUE INDEX "sua_2011_aust01_view_gid_idx" ON "aus_census_2011"."sua_2011_aust01_view" ("gid");


DROP MATERIALIZED VIEW IF EXISTS aus_census_2011.ucl_2011_aust_view CASCADE;

            CREATE MATERIALIZED VIEW aus_census_2011.ucl_2011_aust_view AS
                SELECT
                    
                CASE WHEN ST_Area(geomtable.geom_3857) >= 978393.9620502561 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 4891.96981025128/20, 4891.96981025128/20),
                        244.598490512564
                    )), 4326)
                ELSE NULL END AS geom_4326_z5,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 244598.49051256402 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 1222.99245256282/20, 1222.99245256282/20),
                        61.149622628141
                    )), 4326)
                ELSE NULL END AS geom_4326_z7,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 122299.24525628201 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 305.748113140705/20, 305.748113140705/20),
                        15.28740565703525
                    )), 4326)
                ELSE NULL END AS geom_4326_z9,
                CASE WHEN ST_Area(geomtable.geom_3857) >= 38218.51414258813 THEN
                    ST_Transform(ST_MakeValid(ST_Simplify(
                        ST_SnapToGrid(geomtable.geom_3857, 76.43702828517625/20, 76.43702828517625/20),
                        3.8218514142588127
                    )), 4326)
                ELSE NULL END AS geom_4326_z11,
                    ST_Transform(geom_3857, 4326) AS geom_4326,
                    geomtable.*
                FROM aus_census_2011.ucl_2011_aust AS geomtable;
CREATE INDEX "ucl_2011_aust_view_geom_4326_z5_gist" ON "aus_census_2011"."ucl_2011_aust_view" USING GIST ("geom_4326_z5");
CREATE INDEX "ucl_2011_aust_view_geom_4326_z7_gist" ON "aus_census_2011"."ucl_2011_aust_view" USING GIST ("geom_4326_z7");
CREATE INDEX "ucl_2011_aust_view_geom_4326_z9_gist" ON "aus_census_2011"."ucl_2011_aust_view" USING GIST ("geom_4326_z9");
CREATE INDEX "ucl_2011_aust_view_geom_4326_z11_gist" ON "aus_census_2011"."ucl_2011_aust_view" USING GIST ("geom_4326_z11");
CREATE INDEX "ucl_2011_aust_view_geom_4326_gist" ON "aus_census_2011"."ucl_2011_aust_view" USING GIST ("geom_4326");
CREATE INDEX "ucl_2011_aust_view_geom_3112_gist" ON "aus_census_2011"."ucl_2011_aust_view" USING gist ("geom_3112");
CREATE INDEX "ucl_2011_aust_view_geom_3857_gist" ON "aus_census_2011"."ucl_2011_aust_view" USING gist ("geom_3857");
CREATE INDEX "ucl_2011_aust_view_geom_idx" ON "aus_census_2011"."ucl_2011_aust_view" USING gist ("geom");
CREATE UNIQUE INDEX "ucl_2011_aust_view_ucl_code_idx" ON "aus_census_2011"."ucl_2011_aust_view" ("ucl_code");
CREATE UNIQUE INDEX "ucl_2011_aust_view_gid_idx" ON "aus_census_2011"."ucl_2011_aust_view" ("gid");
