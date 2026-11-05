"""Shared labels for the vendor and CWE chart scripts.

Vendor merging and CWE short names are copied from Abhinav's Tableau scripts
(Group Project/Tableau/scripts/attrib.py and labels.py) so the website numbers
match the Tableau dashboard and the process book. Standard library only.
"""
import json
import re
from pathlib import Path

SUFFIX = (r"\b(inc|incorporated|corp|corporation|co|company|ltd|limited|llc|"
          r"gmbh|ag|se|sa|plc|bv|ab|oy|kk|pty|srl|sas)\b")
NA_KEYS = {"", "na", "nana", "unknown", "none", "unspecified", "various", "multiple"}
ALIASES = {  # name variants of the same vendor -> one key
    "apachesoftwarefoundation": "apache", "android": "google",
    "googlellc": "google", "samsungmobile": "samsung",
    "samsungelectronics": "samsung", "ciscosystems": "cisco",
    "oraclecorporation": "oracle", "junipernetworks": "juniper",
    "hewlettpackardenterprise": "hpe", "sapse": "sap", "jenkinsproject": "jenkins",
    "paloalto": "paloaltonetworks", "foxitsoftware": "foxit", "zohocorp": "zoho",
    "zyxelcorporation": "zyxel", "qnapsystems": "qnap", "synacor": "zimbra",
    "tplink": "tplink", "citrixsystems": "citrix", "f5networks": "f5",
    "progresssoftware": "progress", "trendmicroincorporated": "trendmicro",
    "netscaler": "citrix", "citrixnetscaler": "citrix", "citrixsessionrecording": "citrix",
}
DISPLAY = {
    "microsoft": "Microsoft", "google": "Google", "apple": "Apple",
    "cisco": "Cisco", "adobe": "Adobe", "oracle": "Oracle", "apache": "Apache",
    "ivanti": "Ivanti", "fortinet": "Fortinet", "linux": "Linux",
    "dlink": "D-Link", "vmware": "VMware", "citrix": "Citrix",
    "sonicwall": "SonicWall", "zimbra": "Zimbra (Synacor)",
    "paloaltonetworks": "Palo Alto Networks", "samsung": "Samsung", "sap": "SAP",
    "mozilla": "Mozilla", "atlassian": "Atlassian", "trendmicro": "Trend Micro",
    "qualcomm": "Qualcomm", "zyxel": "Zyxel", "solarwinds": "SolarWinds",
    "roundcube": "Roundcube", "qnap": "QNAP", "redhat": "Red Hat",
    "progress": "Progress", "arm": "Arm", "zoho": "Zoho", "ibm": "IBM",
    "juniper": "Juniper", "netgear": "NETGEAR", "f5": "F5", "mitel": "Mitel",
    "sophos": "Sophos", "jenkins": "Jenkins", "tplink": "TP-Link",
    "gitlab": "GitLab", "hpe": "HPE", "hp": "HP", "dell": "Dell",
    "intel": "Intel", "huawei": "Huawei", "siemens": "Siemens",
    "drupal": "Drupal", "vbulletin": "vBulletin", "joomla": "Joomla!",
    "pulsesecure": "Pulse Secure", "accellion": "Accellion",
    "kaseya": "Kaseya", "connectwise": "ConnectWise", "wordpress": "WordPress",
    "php": "PHP", "nagios": "Nagios", "microfocus": "Micro Focus",
    "draytek": "DrayTek", "barracuda": "Barracuda", "sierrawireless": "Sierra Wireless",
    "telerik": "Telerik", "cpanel": "cPanel", "elastic": "Elastic",
    "arubanetworks": "Aruba Networks", "lenovo": "Lenovo", "nvidia": "NVIDIA",
    "asus": "ASUS", "synology": "Synology", "broadcom": "Broadcom",
    "debian": "Debian", "fedoraproject": "Fedora", "canonical": "Canonical",
    "opensuse": "openSUSE", "netapp": "NetApp", "sun": "Sun",
    "craftcms": "Craft CMS", "magento": "Magento", "openssl": "OpenSSL",
    "ui": "Ubiquiti", "arista": "Arista", "veeam": "Veeam", "mikrotik": "MikroTik",
    "langflow": "Langflow", "webkitgtk": "WebKitGTK", "gnu": "GNU",
    "commvault": "Commvault", "crushftp": "CrushFTP", "sap": "SAP",
    "cyberpanel": "CyberPanel", "craftercms": "CrafterCMS",
}

DISPLAY_EXTRA = {
    "wavlink": "Wavlink", "tenda": "Tenda", "totolink": "TOTOLINK", "sourcecodester": "SourceCodester",
    "xwiki": "XWiki", "jetbrains": "JetBrains", "wordfence": "Wordfence", "fortra": "Fortra",
    "gitlab": "GitLab", "moveit": "MOVEit", "ivanti": "Ivanti", "realtek": "Realtek", "zte": "ZTE",
    "schneiderelectric": "Schneider Electric", "rockwellautomation": "Rockwell Automation",
    "mediatek": "MediaTek", "autodesk": "Autodesk", "hikvision": "Hikvision", "symantec": "Symantec",
    "mcafee": "McAfee", "emc": "EMC", "vmware": "VMware", "netscout": "NETSCOUT", "sitecore": "Sitecore",
    "smartertools": "SmarterTools", "watchguard": "WatchGuard", "array": "Array Networks",
    "arraynetworks": "Array Networks", "sonatype": "Sonatype", "solarwinds": "SolarWinds",
    "papercut": "PaperCut", "manageengine": "ManageEngine", "zohocorp": "Zoho", "vbulletin": "vBulletin",
    "beyondtrust": "BeyondTrust", "trendmicro": "Trend Micro", "sap": "SAP", "kaseya": "Kaseya",
    "magento": "Magento", "wpewebkit": "WPE WebKit", "webkitgtk": "WebKitGTK", "openssl": "OpenSSL",
    "imagemagick": "ImageMagick", "wireshark": "Wireshark", "tcpdump": "tcpdump", "ffmpeg": "FFmpeg",
    "jenkins": "Jenkins", "phpmyadmin": "phpMyAdmin", "qemu": "QEMU", "xen": "Xen", "nodejs": "Node.js",
    "python": "Python", "golang": "Go", "rust-lang": "Rust", "elastic": "Elastic", "grafana": "Grafana",
    "github": "GitHub", "nextcloud": "Nextcloud", "owncloud": "ownCloud", "tibco": "TIBCO",
    "netgear": "NETGEAR", "dell": "Dell", "lenovo": "Lenovo", "asus": "ASUS", "zyxel": "Zyxel",
    "synology": "Synology", "qnap": "QNAP", "nvidia": "NVIDIA", "intel": "Intel", "amd": "AMD",
    "siemens": "Siemens", "huawei": "Huawei", "samsung": "Samsung", "sophos": "Sophos", "veeam": "Veeam",
    "mikrotik": "MikroTik", "langflow": "Langflow", "ui": "Ubiquiti", "mitel": "Mitel", "arm": "Arm",
    "roundcube": "Roundcube", "commvault": "Commvault", "crushftp": "CrushFTP", "craftcms": "Craft CMS",
    "progress": "Progress", "f5": "F5", "juniper": "Juniper", "hpe": "HPE", "hp": "HP",
    "atlassian": "Atlassian", "drupal": "Drupal", "joomla": "Joomla!", "wordpress": "WordPress",
    "php": "PHP", "draytek": "DrayTek", "barracuda": "Barracuda", "telerik": "Telerik",
    "zimbra": "Zimbra", "citrix": "Citrix", "sonicwall": "SonicWall", "paloaltonetworks": "Palo Alto Networks",
    "accellion": "Accellion", "pulsesecure": "Pulse Secure", "connectwise": "ConnectWise",
    "apache": "Apache", "redhat": "Red Hat", "ibm": "IBM", "cisco": "Cisco", "oracle": "Oracle",
    "google": "Google", "apple": "Apple", "adobe": "Adobe", "microsoft": "Microsoft", "linux": "Linux",
    "mozilla": "Mozilla", "qualcomm": "Qualcomm", "dlink": "D-Link", "fortinet": "Fortinet",
    "tplink": "TP-Link", "gladinet": "Gladinet", "simplehelp": "SimpleHelp", "cleo": "Cleo",
    "trueconf": "TrueConf", "qlik": "Qlik", "smarsh": "Smarsh", "geoserver": "GeoServer",
    "rejetto": "Rejetto", "cyberpanel": "CyberPanel", "craftercms": "CrafterCMS", "sierrawireless": "Sierra Wireless",
    "nagios": "Nagios", "microfocus": "Micro Focus", "cpanel": "cPanel", "arubanetworks": "Aruba Networks",
    "broadcom": "Broadcom", "debian": "Debian", "fedoraproject": "Fedora", "canonical": "Canonical",
    "opensuse": "openSUSE", "netapp": "NetApp", "sun": "Sun", "arista": "Arista", "gnu": "GNU",
    "siemens_": "Siemens", "wavlinktechnology": "Wavlink", "jfrog": "JFrog", "openemr": "OpenEMR",
    "phpgurukul": "PHPGurukul", "codeastro": "CodeAstro", "kashipara": "Kashipara", "projectworlds": "Projectworlds",
    "itsourcecode": "itsourcecode", "campcodes": "Campcodes", "code-projects": "code-projects",
    "codeprojects": "code-projects", "fabianros": "Fabian Ros", "utt": "UTT", "dassaultsystemes": "Dassault Systèmes",
    "deltaelectronics": "Delta Electronics", "bosch": "Bosch", "honeywell": "Honeywell", "abb": "ABB",
    "moxa": "Moxa", "advantech": "Advantech", "mitsubishielectric": "Mitsubishi Electric",
    "trellix": "Trellix", "checkpoint": "Check Point", "openbsd": "OpenBSD", "freebsd": "FreeBSD",
    "vim": "Vim", "gpac": "GPAC", "bentley": "Bentley", "softwareag": "Software AG", "splunk": "Splunk",
    "cloudflare": "Cloudflare", "hashicorp": "HashiCorp", "mattermost": "Mattermost", "zabbix": "Zabbix",
    "zoom": "Zoom", "teamviewer": "TeamViewer", "bitdefender": "Bitdefender", "kaspersky": "Kaspersky",
    "avast": "Avast", "eset": "ESET", "acronis": "Acronis", "vercel": "Vercel", "n8n": "n8n",
    "foxit": "Foxit", "rubyonrails": "Ruby on Rails", "veritas": "Veritas", "reolink": "Reolink",
    "dassaultsystmes": "Dassault Systemes", "dassaultsystemes": "Dassault Systemes", "ubiquiti": "Ubiquiti",
    "tibcosoftware": "TIBCO", "aristanetworks": "Arista", "phpgroup": "PHP", "facebook": "Facebook",
}
NAMES = {**DISPLAY, **DISPLAY_EXTRA}

CWE_SHORT = {  # overrides where the derived name is misleading or too long
    "CWE-20": "Improper input validation", "CWE-78": "OS command injection", "CWE-79": "Cross-site scripting (XSS)",
    "CWE-89": "SQL injection", "CWE-94": "Code injection", "CWE-22": "Path traversal",
    "CWE-119": "Memory buffer bounds error", "CWE-200": "Sensitive information exposure",
    "CWE-306": "Missing auth for critical function", "CWE-264": "Permissions & access control (legacy)",
    "CWE-399": "Resource management error (legacy)", "CWE-189": "Numeric error (legacy)",
    "CWE-19": "Data processing error (legacy)", "CWE-254": "Security features (legacy)",
    "CWE-255": "Credentials management (legacy)", "CWE-310": "Cryptographic issue (legacy)",
    "CWE-388": "Error handling (legacy)", "CWE-434": "Unrestricted file upload",
    "CWE-288": "Auth bypass via alternate path", "CWE-611": "XML external entity (XXE)",
    "CWE-138": "Special-element injection", "CWE-404": "Improper resource shutdown",
    "CWE-707": "Improper neutralization", "CWE-80": "Basic XSS", "CWE-472": "Assumed-immutable web parameter",
    "CWE-785": "Path function without max buffer", "CWE-55": "Path equivalence ('/./')",
    "CWE-1336": "Template injection (SSTI)", "CWE-497": "System information exposure",
    "CWE-918": "Server-side request forgery (SSRF)", "CWE-352": "Cross-site request forgery (CSRF)",
    "CWE-1188": "Insecure default initialization", "CWE-347": "Bad crypto signature check",
    "CWE-367": "TOCTOU race condition", "CWE-1220": "Coarse access control",
    "CWE-807": "Untrusted input in security decision", "CWE-552": "Externally accessible files",
    "CWE-158": "Null byte injection", "CWE-754": "Unchecked unusual condition",
    "CWE-134": "Format string", "CWE-1386": "Windows junction/mount point",
    "CWE-829": "Untrusted functionality included", "CWE-209": "Sensitive info in error message",
    "CWE-940": "Unverified channel source", "CWE-305": "Auth bypass by primary weakness",
    "CWE-532": "Sensitive info in log file", "CWE-303": "Broken auth algorithm",
    "CWE-451": "UI misrepresentation", "CWE-591": "Sensitive data in unlocked memory",
    "CWE-610": "External reference to another sphere", "CWE-732": "Incorrect permission assignment",
    "CWE-1285": "Bad index/offset validation", "CWE-1173": "Validation framework misuse",
    "CWE-1023": "Incomplete comparison", "CWE-565": "Unvalidated cookies",
    "CWE-669": "Resource transfer between spheres", "CWE-913": "Dynamic code resource control",
    "CWE-130": "Length parameter inconsistency", "CWE-528": "Exposed core dump",
    "CWE-424": "Unprotected alternate path", "CWE-647": "Non-canonical URL auth decision",
    "CWE-772": "Resource not released", "CWE-358": "Bad standard security check",
    "CWE-280": "Insufficient permissions handling", "CWE-703": "Exceptional condition handling",
    "CWE-664": "Resource lifetime control", "CWE-790": "Special-element filtering",
    "CWE-641": "Unrestricted resource names", "CWE-923": "Unrestricted communication channel",
    "CWE-782": "Exposed IOCTL", "CWE-406": "Network amplification",
    "CWE-40": "Path traversal (UNC share)", "CWE-357": "Insufficient UI warning",
    "CWE-706": "Incorrectly resolved name", "CWE-131": "Wrong buffer size calculation",
    "CWE-91": "XML injection", "CWE-390": "Error detected, no action", "CWE-401": "Memory leak",
    "CWE-1287": "Bad input type validation", "CWE-35": "Path traversal ('.../...//')",
    "CWE-25": "Path traversal ('/../filedir')", "CWE-27": "Path traversal ('dir/../../filename')",
    "CWE-39": "Path traversal ('C:dirname')", "CWE-44": "Path equivalence ('file.name')",
    "CWE-1390": "Weak authentication", "CWE-1393": "Default password",
}
ACRONYM = re.compile(r"^[A-Z0-9][A-Z0-9/()'-]+$")
CWE_OFFICIAL = json.loads((Path(__file__).resolve().parent / "cwe_names.json").read_text(encoding="utf-8"))


def vendor_key(name):
    v = name.lower()
    v = re.sub(r"\(.*?\)", " ", v).replace("_", " ")
    v = re.sub(r"[^a-z0-9 ]", "", v)
    v = re.sub(SUFFIX, " ", v)
    v = re.sub(r"\s+", "", v)
    if v in NA_KEYS:
        return None
    return ALIASES.get(v, v)


def short_name(cwe, official):
    if cwe in CWE_SHORT:
        return CWE_SHORT[cwe]
    m = re.search(r"\('([^']+)'\)", official or "")
    name = m.group(1) if m else (official or cwe)
    words = name.split()
    out = [w if ACRONYM.match(w) else w.lower() for w in words]
    s = " ".join(out)
    s = s[0].upper() + s[1:]
    return s if len(s) <= 40 else s[:38].rstrip() + "…"


def cwe_label(cwe):
    """Short readable name for a CWE id like "CWE-79"."""
    return short_name(cwe, CWE_OFFICIAL.get(cwe))
