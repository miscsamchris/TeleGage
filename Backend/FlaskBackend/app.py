from TeleGage import (
    app,
    db_client,
    open_ai_client,
    aptos_client,
    faucet_client,
    functions,
    types,
    uuid,
    topics_collection,
    community_collection,
    users_collection,
    Account,
    admin_wallet,
    encrypt,
    TelegramClient,
    name,
    api_id,
    api_hash,
)
from flask import url_for, render_template, request
import json
import pickle, os
import requests, traceback
from aptos_sdk.account import Account
from aptos_sdk.account_address import AccountAddress
from aptos_sdk.aptos_cli_wrapper import AptosCLIWrapper
from aptos_sdk.async_client import FaucetClient, RestClient
from aptos_sdk.bcs import Serializer
from aptos_sdk.package_publisher import PackagePublisher
from aptos_sdk.transactions import (
    EntryFunction,
    TransactionArgument,
    TransactionPayload,
    RawTransactionWithData,
    RawTransaction,
)
from aptos_sdk.aptos_token_client import (
    AptosTokenClient,
    Collection,
    Object,
    PropertyMap,
    ReadObject,
    Token,
)
from aptos_sdk.type_tag import StructTag, TypeTag


@app.route("/test")
def test():
    return "Hello World From Python app"


@app.route("/create_telegram_channel", methods=["POST"])
async def create_telegram_channel():
    if request.method == "POST":
        telegram_channel_title = request.json.get("telegram_channel_title", "NA")
        telegram_channel_description = request.json.get(
            "telegram_channel_description", "NA"
        )
        telegram_admin_id = request.json.get("telegram_admin_id", "NA")
        telegram_channel_rules = request.json.get("telegram_channel_rules", "NA")
        telegram_channel_instructions = request.json.get(
            "telegram_channel_instructions", "NA"
        )
        telegram_topics = request.json.get("topics", [])
        try:
            telethon_client = TelegramClient(name, api_id, api_hash)
            async with telethon_client:
                result = await telethon_client(
                    functions.channels.CreateChannelRequest(
                        telegram_channel_title,
                        telegram_channel_description,
                        megagroup=True,
                        forum=True,
                    )
                )
                channel = result.chats[0]
                result = await telethon_client(
                    functions.channels.InviteToChannelRequest(
                        channel, [telegram_admin_id, "TeleGageCommunityBot"]
                    )
                )
                await telethon_client.edit_admin(
                    channel,
                    telegram_admin_id,
                    is_admin=True,
                    add_admins=False,
                    anonymous=False,
                )
                await telethon_client.edit_admin(
                    channel,
                    "TeleGageCommunityBot",
                    is_admin=True,
                    add_admins=False,
                    anonymous=False,
                )
                topic_ids = []
                for topic in telegram_topics:
                    topic_name = topic.get("Name")
                    result = await telethon_client(
                        functions.channels.CreateForumTopicRequest(channel, topic_name)
                    )
                    topic_id = result.updates[-1].message.id
                    topic_item = {
                        "_id": str(uuid.uuid4()),
                        "topic_id": topic_id,
                        "topic_name": topic.get("Name"),
                        "topic_rules": topic.get("Rules"),
                        "topic_instructions": topic.get("Instructions"),
                    }
                    topic_ids.append(
                        topics_collection.insert_one(topic_item).inserted_id
                    )
                users = telethon_client.iter_participants(channel.id)
                user_ids = []
                async for i in users:
                    # print(i)
                    try:
                        if i.bot == False:
                            user_account = Account.generate()
                            try:
                                await faucet_client.fund_account(
                                    user_account.address(), 20_000_000
                                )
                            except:
                                await faucet_client.fund_account(
                                    user_account.address(), 20_000_000
                                )
                            updateddata = str(user_account.private_key)
                            print(user_account.account_address)
                            encrypted = encrypt(
                                str(i.id).encode(), updateddata.encode()
                            )
                            user_item = {
                                "_id": str(uuid.uuid4()),
                                "user_id": str(i.id),
                                "user_name": i.username,
                                "name": f"{i.first_name if i.first_name!=None else '' } {i.last_name if i.last_name!=None else '' }",
                                "TeleTokens_CustodialAddress": str(
                                    user_account.account_address
                                ),
                                "data": str(encrypted),
                                "community_name": telegram_channel_title,
                            }
                            txn_hash = await aptos_client.register_coin(
                                admin_wallet.address(), user_account
                            )
                            await aptos_client.wait_for_transaction(txn_hash)
                            txn_hash = await aptos_client.mint_coin(
                                admin_wallet, user_account.address(), 1000
                            )
                            await aptos_client.wait_for_transaction(txn_hash)
                            user_ids.append(
                                users_collection.insert_one(user_item).inserted_id
                            )
                            balance = await aptos_client.get_balance(
                                admin_wallet.address(), user_account.address()
                            )
                            print(
                                f"Account for {i.username} : initial TeleGage balance: {balance}"
                            )
                    except:
                        print(traceback.format_exc())
            test_community = {
                "_id": str(uuid.uuid4()),
                "community_name": telegram_channel_title,
                "category": "channel",
                "community_description": telegram_channel_description,
                "community_rules": telegram_channel_rules,
                "community_instructions": telegram_channel_instructions,
                "community_id": f"-100{channel.id}",
                "topics": topic_ids,
                "users": user_ids,
            }
            community_collection.insert_one(test_community)
            return {"code": 200, "Message": "Channel created Successfully"}
        except Exception as e:
            # Rollback changes if an error occurs
            print(traceback.format_exc())
    return {"code": 201}


@app.route("/get_topics_by_community", methods=["POST"])
async def get_topics_by_community():
    if request.method == "POST":
        print("JSON", request.json)
        print("fomr", request.form)
        telegram_channel_username = int(
            request.json.get("telegram_channel_username", "NA")
        )
        try:
            telethon_client = TelegramClient(name, api_id, api_hash)
            async with telethon_client:
                async for dialog in telethon_client.iter_dialogs():
                    print(dialog.entity)
                channel = await telethon_client.get_entity(telegram_channel_username)
                date, offset, offset_topic, total = 0, 0, 0, 0
                result = await telethon_client(
                    functions.channels.GetForumTopicsRequest(
                        channel, date, offset, offset_topic, 100, ""
                    )
                )
                topics = result.topics
                topics_list = []
                for i in topics:
                    tname = i.title
                    iden = i.id
                    topics_list.append({"Name": tname, "id": iden})
            return {"code": 200, "Topics": topics_list}
        except Exception as e:
            # Rollback changes if an error occurs
            print(traceback.format_exc())
    return {"code": 201}


@app.route("/kick_user_from_community", methods=["POST"])
async def kick_user_from_community():
    if request.method == "POST":
        print("JSON", request.json)
        telegram_channel_username = int(
            request.json.get("telegram_channel_username", "NA")
        )
        user_id = int(request.json.get("user_id", "NA"))
        try:
            telethon_client = TelegramClient(name, api_id, api_hash)
            async with telethon_client:
                async for dialog in telethon_client.iter_dialogs():
                    print(dialog.entity)
                channel = await telethon_client.get_entity(telegram_channel_username)
                banned_rights = types.ChatBannedRights(
                    until_date=None, view_messages=False
                )
                result = await telethon_client(
                    functions.channels.EditBannedRequest(
                        channel,  # The channel from which to kick the user
                        "pawanakk",  # The user to be kicked
                        banned_rights,  # The ban rights
                    )
                )
            return {"code": 200, "Message": "User Banned Successfully"}
        except Exception as e:
            # Rollback changes if an error occurs
            print(traceback.format_exc())
    return {"code": 201}


@app.route("/import_channel", methods=["POST"])
async def import_channel():
    if request.method == "POST":
        telegram_channel_username = request.json.get("telegram_channel_username", "NA")
        telegram_channel_rules = request.json.get("telegram_channel_rules", "NA")
        telegram_channel_instructions = request.json.get(
            "telegram_channel_instructions", "NA"
        )
        telegram_topics = request.json.get("topics", [])
        try:
            telethon_client = TelegramClient(name, api_id, api_hash)
            async with telethon_client:
                async for dialog in telethon_client.iter_dialogs():
                    print(dialog.entity)
                channel = await telethon_client.get_entity(
                    int(telegram_channel_username)
                )
                result = await telethon_client(
                    functions.channels.InviteToChannelRequest(
                        channel, ["TeleGageCommunityBot"]
                    )
                )
                await telethon_client.edit_admin(
                    channel,
                    "TeleGageCommunityBot",
                    is_admin=True,
                    add_admins=False,
                    anonymous=False,
                )
                topic_ids = []
                for topic in telegram_topics:
                    topic_name = topic.get("Name")
                    topic_status = topic.get("Status")
                    if topic_status == "New":
                        result = await telethon_client(
                            functions.channels.CreateForumTopicRequest(
                                channel, topic_name
                            )
                        )
                        topic_id = result.updates[-1].message.id
                        topic_item = {
                            "_id": str(uuid.uuid4()),
                            "topic_id": topic_id,
                            "topic_name": topic.get("Name"),
                            "topic_rules": topic.get("Rules"),
                            "topic_instructions": topic.get("Instructions"),
                        }
                        topic_ids.append(
                            topics_collection.insert_one(topic_item).inserted_id
                        )
                    else:
                        topic_item = {
                            "_id": str(uuid.uuid4()),
                            "topic_id": topic.get("ID"),
                            "topic_name": topic.get("Name"),
                            "topic_rules": topic.get("Rules"),
                            "topic_instructions": topic.get("Instructions"),
                        }
                        topic_ids.append(
                            topics_collection.insert_one(topic_item).inserted_id
                        )
                users = telethon_client.iter_participants(channel.id)
                user_ids = []
                async for i in users:
                    # print(i)
                    try:
                        if i.bot == False:
                            user_account = Account.generate()
                            try:
                                await faucet_client.fund_account(
                                    user_account.address(), 20_000_000
                                )
                            except:
                                await faucet_client.fund_account(
                                    user_account.address(), 20_000_000
                                )
                            updateddata = str(user_account.private_key)
                            print(user_account.account_address)
                            encrypted = encrypt(
                                str(i.id).encode(), updateddata.encode()
                            )
                            print(encrypted)
                            user_item = {
                                "_id": str(uuid.uuid4()),
                                "user_id": str(i.id),
                                "user_name": i.username,
                                "name": f"{i.first_name if i.first_name!=None else '' } {i.last_name if i.last_name!=None else '' }",
                                "TeleTokens_CustodialAddress": str(
                                    user_account.account_address
                                ),
                                "data": str(encrypted),
                                "community_name": channel.title,
                            }
                            txn_hash = await aptos_client.register_coin(
                                admin_wallet.address(), user_account
                            )
                            await aptos_client.wait_for_transaction(txn_hash)
                            txn_hash = await aptos_client.mint_coin(
                                admin_wallet, user_account.address(), 1000
                            )
                            await aptos_client.wait_for_transaction(txn_hash)
                            user_ids.append(
                                users_collection.insert_one(user_item).inserted_id
                            )
                            balance = await aptos_client.get_balance(
                                admin_wallet.address(), user_account.address()
                            )
                            print(
                                f"Account for {i.username} : initial TeleGage balance: {balance}"
                            )
                    except:
                        pass
            test_community = {
                "_id": str(uuid.uuid4()),
                "community_name": channel.title,
                "category": "channel",
                "community_description": "",
                "community_rules": telegram_channel_rules,
                "community_instructions": telegram_channel_instructions,
                "community_id": f"-100{channel.id}",
                "topics": topic_ids,
                "users": user_ids,
            }
            community_collection.insert_one(test_community)
            return {"code": 200, "Message": "Channel Imported Successfully"}
        except Exception as e:
            # Rollback changes if an error occurs
            print(traceback.format_exc())
    return {"code": 201}


@app.route("/get_topics_by_community", methods=["POST"])
async def get_topics_by_community():
    if request.method == "POST":
        print("JSON", request.json)
        print("fomr", request.form)
        telegram_channel_username = int(
            request.json.get("telegram_channel_username", "NA")
        )
        try:
            telethon_client = TelegramClient(name, api_id, api_hash)
            async with telethon_client:
                async for dialog in telethon_client.iter_dialogs():
                    print(dialog.entity)
                channel = await telethon_client.get_entity(telegram_channel_username)
                date, offset, offset_topic, total = 0, 0, 0, 0
                result = await telethon_client(
                    functions.channels.GetForumTopicsRequest(
                        channel, date, offset, offset_topic, 100, ""
                    )
                )
                topics = result.topics
                topics_list = []
                for i in topics:
                    tname = i.title
                    iden = i.id
                    topics_list.append({"Name": tname, "id": iden})
            return {"code": 200, "Topics": topics_list}
        except Exception as e:
            # Rollback changes if an error occurs
            print(traceback.format_exc())
    return {"code": 201}


# async def register_coin():
#     if request.method == "POST":
#         print("JSON", request.json)
#         moon_coin_path = "<Path Here>"
#         alice = Account.generate()
#         bob = Account.generate()

#         print("\n=== Addresses ===")
#         print(f"Alice: {alice.address()}")
#         print(f"Bob: {bob.address()}")

#         alice_fund = await faucet_client.fund_account(alice.address(), 20_000_000_000)
#         bob_fund = await faucet_client.fund_account(bob.address(), 20_000_000)

#         if AptosCLIWrapper.does_cli_exist():
#             AptosCLIWrapper.compile_package(
#                 moon_coin_path, {"TeleGageToken": alice.address()}
#             )
#         else:
#             input("\nUpdate the module with Alice's address, compile, and press enter.")

#         # :!:>publish
#         module_path = os.path.join(
#             moon_coin_path,
#             "build",
#             "TeleGageToken",
#             "bytecode_modules",
#             "telegage_token.mv",
#         )
#         with open(module_path, "rb") as f:
#             module = f.read()

#         metadata_path = os.path.join(
#             moon_coin_path, "build", "TeleGageToken", "package-metadata.bcs"
#         )
#         with open(metadata_path, "rb") as f:
#             metadata = f.read()

#         print("\nPublishing TeleGage package.")
#         package_publisher = PackagePublisher(aptos_client)
#         txn_hash = await package_publisher.publish_package(alice, metadata, [module])
#         await aptos_client.wait_for_transaction(txn_hash)
#         # <:!:publish

#         print("\nBob registers the newly created coin so he can receive it from Alice.")
#         txn_hash = await aptos_client.register_coin(alice.address(), bob)
#         await aptos_client.wait_for_transaction(txn_hash)
#         balance = await aptos_client.get_balance(alice.address(), bob.address())
#         print(f"Bob's initial TeleGage balance: {balance}")

#         print("Alice mints Bob some of the new coin.")
#         txn_hash = await aptos_client.mint_coin(alice, bob.address(), 100)
#         await aptos_client.wait_for_transaction(txn_hash)
#         balance = await aptos_client.get_balance(alice.address(), bob.address())
#         print(f"Bob's updated TeleGage balance: {balance}")

#         try:
#             maybe_balance = await aptos_client.get_balance(
#                 alice.address(), alice.address()
#             )
#         except Exception:
#             maybe_balance = None
#         print(f"Bob will transfer to Alice, her balance: {maybe_balance}")
#         alice.store("..\\admin")
#         txn_hash = await aptos_client.transfer_coins(
#             bob, alice.address(), f"{alice.address()}::telegage_token::TeleGageToken", 5
#         )
#         await aptos_client.wait_for_transaction(txn_hash)
#         balance = await aptos_client.get_balance(alice.address(), alice.address())
#         print(f"Alice's updated MoonCoin balance: {balance}")
#         balance = await aptos_client.get_balance(alice.address(), bob.address())
#         print(f"Bob's updated MoonCoin balance: {balance}")


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=False)
