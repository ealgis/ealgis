node default {
    class { 'apt': }

    apt::ppa { 'ppa:ubuntugis/ppa':
    }

    package { "postgis":
      name => ["proj-data", "postgresql-9.3-postgis-2.1"],
      require => [ Apt::Ppa["ppa:ubuntugis/ppa"], Package["postgresql-server"] ], 
    }

    class { 'postgresql::globals':
      manage_package_repo => true,
      version             => '9.3',
    } ->
    class { 'postgresql::server':
      ipv4acls => ['local all all trust'],
    } ->
    postgresql::server::role { "vagrant":
      password_hash => postgresql_password('vagrant', 'vagrant'),
      superuser => true,
    }

    package { "default-jre":
      ensure => "installed"
    }
    package { "tmux":
      ensure => "installed"
    }
    package { "python-dev":
      ensure => "installed"
    }
    package { "git":
      ensure => "installed"
    }
    package { "python-pip":
      ensure => "installed",
      require => [ Package["python-dev"], Package["git"] ]
    }
    package { "uwsgi":
      ensure => "installed",
      name => [ "uwsgi", "uwsgi-plugin-python", "uwsgi-plugin-http" ]
    }
    package { "python-psycopg2":
      ensure => "installed",
      require => [ Apt::Ppa["ppa:ubuntugis/ppa"], Package["postgresql-server"] ], 
    }
    package { "python-gdal":
      ensure => "installed",
      require => [ Apt::Ppa["ppa:ubuntugis/ppa"], Package["postgresql-server"] ], 
    }
    package { "python-mapscript":
      ensure => "installed",
      require => [ Apt::Ppa["ppa:ubuntugis/ppa"], Package["postgresql-server"] ], 
    }
    package { "python-cairo":
      ensure => "installed",
      require => [ Apt::Ppa["ppa:ubuntugis/ppa"], Package["postgresql-server"] ], 
    }
    package { "pythonbits":
      name => ["simplejson", "markdown", "Geoalchemy", "flask", "flask-sqlalchemy", "ipython", "openpyxl", "flake8", "nose"],
      provider => "pip",
      ensure => "installed",
      require => [ Package["python-pip"] ]
    }
    # unfortunately 12.04 lxml is too old so need to build a newer one
    package { "lxml":
      name => ["lxml"],
      provider => "pip",
      ensure => "installed",
      require => [ Package["python-pip"], Package["libxml2-dev"], Package["pkg-config"] ]
    }
    package { "flask-browserid":
      name => ["git+https://github.com/garbados/flask-browserid.git"],
      provider => "pip",
      ensure => "installed",
      require => [ Package["python-pip"] ]
    }
    package { "liblzma-dev":
      ensure => 'installed'
    }
    package { "libxml2-dev":
      ensure => 'installed'
    }
    package { "libxslt-dev":
      ensure => 'installed'
    }
    package { "pkg-config":
      ensure => 'installed'
    }
    package { "p7zip":
      ensure => 'installed'
    }
    package { "gdal-bin":
      ensure => 'installed'
    }
    package { "man-db":
      ensure => 'installed'
    }
    package { "pyparsing":
      ensure => 'installed',
      provider => "pip",
      require => [ Package["python-pip"] ]
    }
    package { "rauth":
      ensure => 'installed',
      provider => "pip",
      require => [ Package["python-pip"] ]
    }
    package { "backports-lzma":
      name => ["git+https://github.com/peterjc/backports.lzma"],
      provider => "pip",
      ensure => "installed",
      require => [ Package["liblzma-dev"], Package["python-pip"] ]
    }

    # useful to some modules, but not globally required; FIXME put these 
    # somewhere else
    package { "firefox":
      ensure => "installed",
    }
    apt::ppa { 'ppa:chris-lea/node.js':
    }
    package { ["nodejs"]:
      ensure => "installed",
      require => [ Apt::Ppa["ppa:chris-lea/node.js"] ]
    }

    # nginx setup
    package { "nginx":
      ensure => "installed",
    } ->
    file { "/etc/nginx/sites-enabled/default":
        ensure => absent,
    } ->
    file { "/etc/nginx/sites-enabled/ealgis":
        content => template("/vagrant/nginx.erb"),
        ensure => present
    } ->
    service { "nginx":
        hasrestart => true,
        ensure => "running",
    }
}
