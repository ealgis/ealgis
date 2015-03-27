#!/usr/bin/env python
# -*- coding: utf-8 -*-

# EAlGIS
# Copyright 2012, Grahame Bowland <grahame@angrygoats.net>

import imp
import os
import csv
import sys
import email
from db import EAlGIS, User


def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--verbose', '-v', action='store_const', const=True, help='verbose mode')
    subparsers = parser.add_subparsers(help='sub-command help')

    def syncdb(args):
        print "syncing database"
        eal = EAlGIS()
        db = eal.db
        db.create_all()
        db.session.commit()
        eal.create_extensions()

    def list_users(args):
        db = EAlGIS().db
        w = csv.writer(sys.stdout)
        for user in db.session.query(User).order_by(User.email_address):
            w.writerow([user.email_address, user.name])

    def add_user(args):
        eal = EAlGIS()
        db = eal.db
        addresses = []
        for s in args.email_address:
            parts = [t.strip() for t in s.split(',')]
            for part in parts:
                name, email_address = email.utils.parseaddr(part)
                addresses.append((name, email_address))
        for (name, email_address) in addresses:
            if eal.get_user_by_email(email_address) is not None:
                print "User %s / %s already has access, skipped." % (name, email_address)
                continue
            db.session.add(User(email_address=email_address, name=name))
            db.session.commit()
            print "User %s / %s added." % (name, email_address)

    def query(args):
        eal = EAlGIS()
        from dataexpr import DataExpression
        iters = []
        data = {}
        for expr in args.equation:
            ti = eal.get_table_info(args.geometry)
            geometry_source = ti.geometry_source
            it = iter(DataExpression(
                "CLI",
                geometry_source,
                expr,
                "",
                3112,
                include_geometry=False,
                order_by_gid=True).get_query().yield_per(1))
            data[expr] = {}
            for gid, v in it:
                data[expr][gid] = v
        all_gids = set()
        for expr in data:
            all_gids = all_gids.union(set(data[expr].keys()))
        w = csv.writer(sys.stdout)
        w.writerow(['gid'] + args.equation)

        for gid in sorted(all_gids):
            row = [gid] + [data[t].get(gid) for t in args.equation]
            w.writerow(row)

    def delete_user(args):
        db = EAlGIS().db
        u = User.query.filter(User.email_address == args.email_address).one()
        db.session.delete(u)
        db.session.commit()

    def unload(args):
        eal = EAlGIS()
        eal.unload(args.table_name)

    def georelate(args):
        eal = EAlGIS()
        left_source = eal.get_table_info(args.geom_left).geometry_source
        right_source = eal.get_table_info(args.geom_right).geometry_source
        from .georelate import build_relations
        build_relations(left_source, right_source)

    def fn_set(args):
        eal = EAlGIS()
        eal.set_setting(args.key, args.value)
        print("`%s' now set to `%s'" % (args.key, args.value))

    def fn_clear(args):
        eal = EAlGIS()
        eal.clear_setting(args.key)
        print("`%s' cleared." % (args.key))

    def run(args):
        eal = EAlGIS()
        opts = []
        if args.opts is not None:
            opts = [t.split(':', 2) for t in args.opts.split(',')]
        for module in args.module:
            module_name = os.path.splitext(os.path.basename(module))[0]
            opts_module = dict([tuple(t[1:3]) for t in opts if t[0] == module_name])
            print "running loader:", module, repr(opts_module)
            loader = imp.load_source('_plugin', module)
            tmpdir = '/data/tmp'
            try:
                os.mkdir(tmpdir)
            except OSError:
                pass
            loader.go(eal, tmpdir, **opts_module)
            del loader

    def recompile(args):
        eal = EAlGIS()
        eal.recompile_all()
        eal.db.session.commit()

    # parse command line options, then hand off to the appropriate
    # function listed above
    parser_syncdb = subparsers.add_parser('syncdb', help='Sync Database')
    parser_syncdb.set_defaults(func=syncdb)

    parser_set = subparsers.add_parser('set', help='Configure EAlGIS')
    parser_set.add_argument('key', type=str)
    parser_set.add_argument('value', type=str)
    parser_set.set_defaults(func=fn_set)

    parser_clear = subparsers.add_parser('clear', help='Configure EAlGIS')
    parser_clear.add_argument('key', type=str)
    parser_clear.set_defaults(func=fn_clear)

    parser_run = subparsers.add_parser('run', help='Run data loader')
    parser_run.add_argument('module', type=str, nargs='+', help='Path to loader module')
    parser_run.add_argument('--opts', '-o', help='loader options')
    parser_run.set_defaults(func=run)

    parser_listusers = subparsers.add_parser('listusers', help="List users")
    parser_listusers.set_defaults(func=list_users)

    parser_adduser = subparsers.add_parser('adduser', help="Add user(s)")
    parser_adduser.add_argument('email_address', type=str, nargs='+', help="email address")
    parser_adduser.set_defaults(func=add_user)

    parser_query = subparsers.add_parser('query', help="Evaluate equations on a geometry")
    parser_query.add_argument('geometry', type=str)
    parser_query.add_argument('equation', type=str, nargs='+', help="equations to evaluate (eg. \"b3+b4\")")
    parser_query.set_defaults(func=query)

    parser_deleteuser = subparsers.add_parser('deleteuser', help="Add a user")
    parser_deleteuser.add_argument('email_address', type=str, help="email address")
    parser_deleteuser.set_defaults(func=delete_user)

    parser_unload = subparsers.add_parser('unload', help="Remove table")
    parser_unload.add_argument('table_name', type=str, help="Table to unload")
    parser_unload.set_defaults(func=unload)

    parser_georelate = subparsers.add_parser('georelate', help="Relate geometries")
    parser_georelate.add_argument('geom_left', type=str, help="Left geometry")
    parser_georelate.add_argument('geom_right', type=str, help="Right geometry")
    parser_georelate.set_defaults(func=georelate)

    parser_recompile = subparsers.add_parser('recompile', help="Recompile cached SQL queries")
    parser_recompile.set_defaults(func=recompile)

    args = parser.parse_args()
    if args.verbose:
        EAlGIS().db.engine.echo = True
    args.func(args)
