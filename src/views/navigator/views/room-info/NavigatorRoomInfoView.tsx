import classNames from 'classnames';
import { RoomMuteComposer, RoomSettingsComposer, RoomStaffPickComposer, UserHomeRoomComposer } from 'nitro-renderer';
import { FC, useCallback, useEffect, useState } from 'react';
import { GetConfiguration } from '../../../../api';
import { NavigatorEvent } from '../../../../events';
import { RoomWidgetThumbnailEvent } from '../../../../events/room-widgets/thumbnail';
import { dispatchUiEvent } from '../../../../hooks/events';
import { SendMessageHook } from '../../../../hooks/messages';
import { NitroCardContentView, NitroCardHeaderView, NitroCardView } from '../../../../layout';
import { LocalizeText } from '../../../../utils/LocalizeText';
import { BadgeImageView } from '../../../shared/badge-image/BadgeImageView';
import { useNavigatorContext } from '../../context/NavigatorContext';
import { NavigatorActions } from '../../reducers/NavigatorReducer';
import { NavigatorRoomInfoViewProps } from './NavigatorRoomInfoView.types';

export const NavigatorRoomInfoView: FC<NavigatorRoomInfoViewProps> = props =>
{
    const { onCloseClick = null } = props;
    
    const { navigatorState = null, dispatchNavigatorState = null } = useNavigatorContext();
    const { roomInfoData = null, homeRoomId = null } = navigatorState;
    const [ roomThumbnail, setRoomThumbnail ] = useState(null);
    const [ isRoomPicked, setIsRoomPicked ] = useState(false);
    const [ isRoomMuted, setIsRoomMuted ] = useState(false);

    useEffect(() =>
    {
        if(!roomInfoData || !roomInfoData.enteredGuestRoom) return;
        
        if(roomInfoData.enteredGuestRoom.officialRoomPicRef)
        {
            setRoomThumbnail(GetConfiguration<string>('image.library.url') + roomInfoData.enteredGuestRoom.officialRoomPicRef);
        }

        setIsRoomPicked(roomInfoData.enteredGuestRoom.roomPicker);
        setIsRoomMuted(roomInfoData.enteredGuestRoom.allInRoomMuted);
    }, [ roomInfoData ]);
    
    const processAction = useCallback((action: string, value?: string) =>
    {
        if(!roomInfoData || !roomInfoData.enteredGuestRoom) return;

        switch(action)
        {
            case 'set_home_room':
                let newRoomId = -1;

                if(homeRoomId !== roomInfoData.enteredGuestRoom.roomId)
                {
                    newRoomId = roomInfoData.enteredGuestRoom.roomId;
                }

                dispatchNavigatorState({
                    type: NavigatorActions.SET_HOME_ROOM_ID,
                    payload: {
                        homeRoomId: newRoomId
                    }
                });

                SendMessageHook(new UserHomeRoomComposer(newRoomId));
                return;
            case 'navigator_search_tag':
                return;
            case 'open_room_thumbnail_camera':
                dispatchUiEvent(new RoomWidgetThumbnailEvent(RoomWidgetThumbnailEvent.TOGGLE_THUMBNAIL));
                return;
            case 'open_group_info':
                return;
            case 'toggle_room_link':
                dispatchUiEvent(new NavigatorEvent(NavigatorEvent.TOGGLE_ROOM_LINK));
                return;
            case 'open_room_settings':
                SendMessageHook(new RoomSettingsComposer(roomInfoData.enteredGuestRoom.roomId));
                return;
            case 'toggle_pick':
                setIsRoomPicked(value => !value);
                SendMessageHook(new RoomStaffPickComposer(roomInfoData.enteredGuestRoom.roomId));
                return;
            case 'toggle_mute':
                setIsRoomMuted(value => !value);
                SendMessageHook(new RoomMuteComposer());
            return;
            case 'close':
                onCloseClick();
                return;
        }
        
    }, [ onCloseClick, dispatchNavigatorState, roomInfoData, homeRoomId ]);

    if(!roomInfoData) return null;
    
    return (
        <NitroCardView className="nitro-room-info" simple={ true }>
            <NitroCardHeaderView headerText={ LocalizeText('navigator.roomsettings.roominfo') } onCloseClick={ () => processAction('close') } />
            <NitroCardContentView className="text-black">
                { roomInfoData.enteredGuestRoom && <>
                    <div className="d-flex justify-content-between align-items-center">
                        <div className="fw-bold">
                            { roomInfoData.enteredGuestRoom.roomName }
                        </div>
                        <i onClick={ () => processAction('set_home_room') } className={ 'icon icon-house-small cursor-pointer' + classNames({' gray': homeRoomId !== roomInfoData.enteredGuestRoom.roomId }) } />
                    </div>
                    <div className="d-flex align-items-center">
                        { roomInfoData.enteredGuestRoom.showOwner && <>
                            <div className="fw-bold text-muted me-1">{ LocalizeText('navigator.roomownercaption') }</div>
                            <div className="d-flex align-items-center cursor-pointer">
                                <i className="icon icon-user-profile me-1" />
                                <div>{ roomInfoData.enteredGuestRoom.ownerName }</div>
                            </div>
                        </> }
                    </div>
                    <div>
                        <span className="fw-bold text-muted me-1">{ LocalizeText('navigator.roomrating') }</span> { roomInfoData.enteredGuestRoom.score }
                    </div>
                    <div className="d-flex mb-1">
                        { roomInfoData.enteredGuestRoom.tags.map(tag =>
                            {
                                return <div className="bg-muted p-1 rounded me-1 cursor-pointer" onClick={ () => processAction('navigator_search_tag', tag) }>#{ tag }</div>
                            }) }
                    </div>
                    <div>{ roomInfoData.enteredGuestRoom.description }</div>
                    <div className="room-thumbnail border mt-1 mb-2">
                        <i className="icon icon-camera-small position-absolute b-0 r-0 m-1 cursor-pointer" onClick={ () => processAction('open_room_thumbnail_camera') } />
                        { roomThumbnail && <img alt="" src={ roomThumbnail } /> }
                    </div>
                    { roomInfoData.enteredGuestRoom.habboGroupId > 0 && <div className="d-flex align-items-center mb-2 cursor-pointer" onClick={ () => processAction('open_group_info') }>
                        <div className="me-2">
                            <BadgeImageView badgeCode={ roomInfoData.enteredGuestRoom.groupBadgeCode } isGroup={ true } />
                        </div>
                        <div className="text-decoration-underline">
                            { LocalizeText('navigator.guildbase', ['groupName'], [roomInfoData.enteredGuestRoom.groupName]) }
                        </div>
                    </div> }
                    <div className="cursor-pointer text-decoration-underline d-flex align-items-center mb-2" onClick={ () => processAction('toggle_room_link') }>
                        <i className="icon icon-arrows me-1" />
                        <span>{ LocalizeText('navigator.embed.caption') }</span>
                    </div>
                    <button className="btn btn-sm btn-primary w-100 mb-1" onClick={ () => processAction('open_room_settings') }>{ LocalizeText('navigator.room.popup.info.room.settings') }</button>
                    <button className="btn btn-sm btn-primary w-100 mb-1" disabled={ true }>{ LocalizeText('open.floor.plan.editor') }</button>
                    <button className="btn btn-sm btn-primary w-100 mb-1" onClick={ () => processAction('toggle_pick') }>{ LocalizeText(isRoomPicked ? 'navigator.staffpicks.unpick' : 'navigator.staffpicks.pick') }</button>
                    <button className="btn btn-sm btn-danger w-100 mb-1" disabled={ true }>{ LocalizeText('help.emergency.main.report.room') }</button>
                    <button className="btn btn-sm btn-primary w-100" onClick={ () => processAction('toggle_mute') }>{ LocalizeText(isRoomMuted ? 'navigator.muteall_on' : 'navigator.muteall_off') }</button>
                </> }
                
            </NitroCardContentView>
        </NitroCardView>
    );
};