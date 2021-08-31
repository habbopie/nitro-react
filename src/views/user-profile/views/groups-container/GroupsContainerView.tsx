import { GroupInformationComposer, GroupInformationEvent, GroupInformationParser } from '@nitrots/nitro-renderer';
import classNames from 'classnames';
import { FC, useCallback, useEffect, useState } from 'react';
import { CreateMessageHook, SendMessageHook } from '../../../../hooks';
import { GroupInformationView } from '../../../groups/views/information/GroupInformationView';
import { BadgeImageView } from '../../../shared/badge-image/BadgeImageView';
import { GroupsContainerViewProps } from './GroupsContainerView.types';

export const GroupsContainerView: FC<GroupsContainerViewProps> = props =>
{
    const { groups = null, onLeaveGroup = null } = props;

    const [ selectedGroupId, setSelectedGroupId ] = useState<number>(null);
    const [ groupInformation, setGroupInformation ] = useState<GroupInformationParser>(null);

    const onGroupInformationEvent = useCallback((event: GroupInformationEvent) =>
    {
        const parser = event.getParser();

        if(!selectedGroupId || selectedGroupId !== parser.id || parser.flag) return;

        if(groupInformation) setGroupInformation(null);

        setGroupInformation(parser);
    }, [ groupInformation, selectedGroupId ]);

    CreateMessageHook(GroupInformationEvent, onGroupInformationEvent);

    useEffect(() =>
    {
        if(groups.length > 0 && !selectedGroupId) setSelectedGroupId(groups[0].id);
    }, [ groups, selectedGroupId ]);

    useEffect(() =>
    {
        if(selectedGroupId) SendMessageHook(new GroupInformationComposer(selectedGroupId, false));
    }, [ selectedGroupId ]);

    if(!groups) return null;
    
    return (
        <div className="d-flex">
            <div className="profile-groups p-2">
                <div className="h-100 overflow-auto d-flex flex-column gap-1">
                    { groups.map((group, index) =>
                        {
                            return <div key={ index } onClick={ () => setSelectedGroupId(group.id) } className={ 'profile-groups-item flex-shrink-0 d-flex align-items-center justify-content-center cursor-pointer' + classNames({ ' active': selectedGroupId === group.id }) }>
                                <BadgeImageView badgeCode={ group.badge } isGroup={ true } />
                            </div>
                        }) }
                </div>
            </div>
            <div className="w-100">
                { groupInformation && <GroupInformationView groupInformation={ groupInformation } onClose={ onLeaveGroup } /> }
            </div>
        </div>
    );
}