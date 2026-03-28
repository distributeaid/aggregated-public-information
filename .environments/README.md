# Secrets

App secrets are stored as SOPS-encrypted YAML files in this directory. Each environment has its own file (`staging.secrets.enc.yaml`, etc.). Secrets are decrypted at deploy time by CI.

## Prerequisites

Install [sops](https://github.com/getsops/sops) and [age](https://github.com/FiloSottile/age):

**macOS**
```sh
brew install sops age
```

**Linux**
```sh
# sops: download the binary for your architecture from
# https://github.com/getsops/sops/releases/latest

# age
sudo apt install age        # Debian/Ubuntu
sudo dnf install age        # Fedora
sudo pacman -S age          # Arch
```

**Windows** (PowerShell)
```powershell
scoop install sops age
# or
winget install mozilla.sops filippo.age
```

Store your age private key at:

| OS | Path |
|----|------|
| macOS / Linux | `~/.config/sops/age/keys.txt` |
| Windows | `%AppData%\sops\age\keys.txt` |

## Editing secrets

```sh
sops .environments/staging.secrets.enc.yaml
```

SOPS decrypts the file, opens it in your editor, and re-encrypts on save.

## Getting access

Generate an age key pair and share the public key with someone who already has access:

**macOS / Linux**
```sh
age-keygen -o ~/.config/sops/age/keys.txt
```

**Windows** (PowerShell)
```powershell
age-keygen -o "$env:AppData\sops\age\keys.txt"
```

`age-keygen` prints your public key (`age1...`) to stdout. Share that value, not the file.

## Granting access

1. Add the new public key to `.sops.yaml`:
   ```yaml
   creation_rules:
     - path_regex: \.enc\.yaml$
       age: >-
         age198gq0jfpeju4hceg3cez9mqpufe9h08upx95e2f70cr3dklttqts35ch5t,
         age1<new-key-here>
   ```

2. Re-encrypt all secrets files:
   ```sh
   sops updatekeys .environments/staging.secrets.enc.yaml
   ```

3. Commit the updated `.sops.yaml` and re-encrypted files.

## Removing access

1. Remove the person's public key from `.sops.yaml`.
2. Re-encrypt all secrets files:
   ```sh
   sops updatekeys .environments/staging.secrets.enc.yaml
   ```
3. Commit the changes.
4. Rotate any secrets they had access to, as re-encrypting does not invalidate what was previously decrypted.
